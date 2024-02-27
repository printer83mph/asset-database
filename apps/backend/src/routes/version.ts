import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { versionSchema } from 'validation';
import { readFile } from 'node:fs/promises';
import os from 'node:os';

import { version } from '../../db/schema';
import { authedProcedure, router } from '../trpc';
import path from 'node:path';

const versionRouter = router({
  getFile: authedProcedure
    .input(versionSchema.pick({ assetPath: true, semver: true }))
    .query(async ({ ctx, input: { assetPath, semver } }) => {
      let rows;
      try {
        rows = await ctx.db
          .select({ reference: version.reference })
          .from(version)
          .where(
            and(eq(version.assetPath, assetPath), eq(version.semver, semver)),
          );
      } catch (err) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      if (rows.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Could not find a matching asset version',
        });
      }

      const [{ reference }] = rows;

      // TODO: use S3 or something
      const fileContents = await readFile(
        path.join(os.tmpdir(), `${reference}.asset`),
        { encoding: 'base64' },
      );

      return { fileContents };
    }),
});

export default versionRouter;
