import express from 'express';
import { z } from 'zod';

import { asset, version } from '../../db/schema';
import db from '../lib/database';
import { withZod } from '../lib/util';
import { assetInsertSchema, versionInsertSchema } from '../schema/db-models';

const assetRouter = express.Router();

const assetNewPOSTSchema = z.intersection(
  assetInsertSchema,
  z.object({
    initialVersion: versionInsertSchema.omit({ assetPath: true }).optional(),
  }),
);
export type AssetNewPOSTRequest = z.infer<typeof assetNewPOSTSchema>;

assetRouter.post(
  '/new',
  withZod(assetNewPOSTSchema, async (data, _req, res, next) => {
    try {
      {
        // upload asset itself
        const response = await db
          .insert(asset)
          .values(data)
          .onConflictDoNothing();
        if (response.changes === 0)
          return res
            .status(400)
            .send(`The provided path "${data.path}" was taken!`);
      }

      // upload initial version
      const { initialVersion, path: assetPath } = data;
      if (initialVersion) {
        await db.insert(version).values({ assetPath, ...initialVersion });

        return res.send('Successfully created asset with initial version!');
      }

      res.send('Successfully created empty asset!');
    } catch (err) {
      return next(err);
    }
  }),
);

export default assetRouter;
