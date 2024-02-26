import * as trpcExpress from '@trpc/server/adapters/express';
import cors from 'cors';
import express, { ErrorRequestHandler } from 'express';
import morgan from 'morgan';

import { populateEnv } from './env';
import sessionMiddleware from './middleware/session';
import { createContext, appRouter as router } from './router';

populateEnv();

const app = express();

app.use(cors());

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.use(sessionMiddleware(app));

app.use(
  '/api/trpc',
  trpcExpress.createExpressMiddleware({ router, createContext }),
);

app.use((req, res) => {
  res.status(404).send(`Error 404: Could not find ${req.path}`);
});

// we gotta do this so express knows it's an error handler (4 args)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error('Internal error:', err);
  res.status(500).send('Internal Server Error');
};

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Now listening on port ${process.env.PORT}.`);
});
