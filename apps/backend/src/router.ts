import * as trpcExpress from '@trpc/server/adapters/express';

import db from './lib/database';
import assetRouter from './routes/asset';
import { router } from './trpc';
import authRouter from './routes/auth';

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({
  db,
  express: { req, res },
});

export type Context = Awaited<ReturnType<typeof createContext>>;

export const appRouter = router({
  asset: assetRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
