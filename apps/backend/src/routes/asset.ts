import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { assetSchema, versionSchema } from 'validation/src/db-models';
import { pathSchema } from 'validation/src/semantics';
import { z } from 'zod';

import { asset, version } from '../../db/schema';
import db from '../lib/database';
import { authedProcedure, router } from '../trpc';

const assetRouter = router({
  create: authedProcedure
    .meta({ openapi: { method: 'POST', path: '/asset/new' } })
    .input(
      z.object({
        asset: assetSchema,
        initialVersion: versionSchema
          .omit({ assetPath: true, author: true })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let result;
      try {
        // upload asset itself
        result = await db
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
        await db
          .insert(version)
          .values({ assetPath, author: ctx.user.pennkey, ...initialVersion });

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

      return {
        asset: rows[0].asset,
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
});

export default assetRouter;
