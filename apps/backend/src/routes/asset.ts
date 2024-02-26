import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { asset, version } from '../../db/schema';
import db from '../lib/database';
import { assetInsertSchema, versionInsertSchema } from '../schema/db-models';
import { pathSchema } from '../schema/semantics';
import { authedProcedure, router } from '../trpc';

const assetRouter = router({
  create: authedProcedure
    .meta({ openapi: { method: 'POST', path: '/asset/new' } })
    .input(
      z.object({
        asset: assetInsertSchema,
        initialVersion: versionInsertSchema
          .omit({ assetPath: true, author: true })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // upload asset itself
        const result = await db
          .insert(asset)
          .values(input.asset)
          .onConflictDoNothing();
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
      } catch (err) {
        // uh oh internal error
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
  get: authedProcedure
    .meta({ openapi: { method: 'GET', path: '/asset/{path}' } })
    .input(z.object({ path: pathSchema }))
    .query(async ({ ctx, input: { path } }) => {
      try {
        const rows = await ctx.db
          .selectDistinct()
          .from(asset)
          .leftJoin(version, eq(version.assetPath, path))
          .where(eq(asset.path, path));

        if (rows.length === 0)
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Could not find an asset matching path ${path}`,
          });

        return {
          asset: rows[0].asset,
          versions: rows
            .map(({ version }) => version)
            .filter(
              (version) => version !== null,
            ) as (typeof version.$inferSelect)[],
        };
      } catch (err) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
});

export default assetRouter;
