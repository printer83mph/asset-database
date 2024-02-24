import express from 'express';
import { z } from 'zod';

import { asset, version } from '../../db/schema';
import db from '../lib/database';
import { assetInsertSchema, versionInsertSchema } from '../schema/db-models';

const assetRouter = express.Router();

const assetNewPOSTSchema = z.intersection(
  assetInsertSchema,
  z.object({
    initialVersion: versionInsertSchema.omit({ assetPath: true }).optional(),
  }),
);
export type AssetNewPOSTRequest = z.infer<typeof assetNewPOSTSchema>;

assetRouter.post('/new', async (req, res) => {
  const result = await assetNewPOSTSchema.safeParseAsync(req.body);
  if (!result.success)
    return res
      .status(400)
      .send(
        `Invalid asset POST body.<br><br>${result.error.issues
          .map(
            ({ path, message }) =>
              `<code>${path.join('.')}</code>: ${message}.`,
          )
          .join('<br>')}`,
      );

  try {
    {
      // upload asset itself
      const response = await db
        .insert(asset)
        .values(result.data)
        .onConflictDoNothing();
      if (response.changes === 0)
        return res
          .status(400)
          .send(`The provided path "${result.data.path}" was taken!`);
    }

    // upload initial version
    const { initialVersion, path: assetPath } = result.data;
    if (initialVersion) {
      await db.insert(version).values({ assetPath, ...initialVersion });

      return res.send('Successfully created asset with initial version!');
    }

    res.send('Successfully created empty asset!');
  } catch (err) {
    res
      .status(500)
      .send(
        `Something went wrong: ${err instanceof Error ? err.message : `we have no idea`}`,
      );
  }
});

export default assetRouter;
