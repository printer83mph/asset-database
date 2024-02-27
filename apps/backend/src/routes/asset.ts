import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { assetSchema, pathSchema, versionSchema } from 'validation';
import { z } from 'zod';

import { asset, version } from '../../db/schema';
import { authedProcedure, router } from '../trpc';

const assetRouter = router({
  create: authedProcedure
    .meta({ openapi: { method: 'POST', path: '/asset/new' } })
    .input(
      z.object({
        asset: assetSchema,
        initialVersion: versionSchema
          .pick({ semver: true })
          .extend({ fileContents: z.string().min(1) })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let result;
      try {
        // upload asset itself
        result = await ctx.db
          .insert(asset)
          .values(input.asset)
          .onConflictDoNothing();
      } catch (err) {
        // uh oh internal error
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      if (result.changes === 0)
        throw new TRPCError({
          message: `The provided path "${input.asset.path}" was taken!`,
          code: 'BAD_REQUEST',
        });

      const {
        initialVersion,
        asset: { path: assetPath },
      } = input;

      // upload initial version
      if (initialVersion) {
        // TODO: upload to S3 (also refactor this stuff)
        // for now we just save to disk in base64 format

        // to extract extension and whatnot
        // const regex = /^data:.+\/(.+);base64,(.*)$/;
        // const matches = initialVersion.fileContents.match(regex)!;
        // const ext = matches[1]
        // const fileData = matches[2];
        // TODO: also save file extension LOL

        const fileId = crypto.randomUUID();
        await writeFile(
          path.join(tmpdir(), `${fileId}.asset`),
          initialVersion.fileContents,
          { encoding: 'ascii' },
        );

        await ctx.db.insert(version).values({
          assetPath,
          author: ctx.user.pennkey,
          changes: 'Initial version',
          reference: fileId,
          ...initialVersion,
        });

        // return success with path and version
        return { path: assetPath, semver: initialVersion.semver };
      }

      // return success with just path
      return { path: assetPath };
    }),
  get: authedProcedure
    .meta({ openapi: { method: 'GET', path: '/asset/{path}' } })
    .input(z.object({ path: pathSchema }))
    .query(async ({ ctx, input: { path } }) => {
      let rows;
      try {
        rows = await ctx.db
          .select()
          .from(asset)
          .leftJoin(version, eq(version.assetPath, path))
          .where(eq(asset.path, path));
      } catch (err) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      if (rows === null || rows.length === 0)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Could not find an asset matching path ${path}`,
        });

      const assetData = rows[0].asset;
      return {
        asset: {
          ...assetData,
          keywords: (assetData.keywords || undefined)?.split(','),
        },
        versions: (
          rows
            .map(({ version }) => version)
            .filter(
              (version) => version !== null,
            ) as (typeof version.$inferSelect)[]
        )
          // clear asset path (it's redundant)
          .map((version) => ({ ...version, assetPath: undefined })),
      };
    }),
  list: authedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.select().from(asset);
    return rows.map(({ keywords, ...asset }) => ({
      ...asset,
      keywords: (keywords || undefined)?.split(','),
    }));
  }),
});

export default assetRouter;
