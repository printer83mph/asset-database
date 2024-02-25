import express, { ErrorRequestHandler } from 'express';
import morgan from 'morgan';
import passport from 'passport';

import { populateEnv } from './env';
import CustomError from './lib/custom-error';
import sessionMiddleware from './middleware/session';
import assetRouter from './routes/asset';
import authRouter from './routes/auth';

const app = express();

populateEnv();

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.use(sessionMiddleware(app));
app.use(passport.session());

app.use('/api/auth', authRouter);
app.use('/api/asset', assetRouter);

// we gotta do this so express knows it's an error handler (4 args)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof CustomError) {
    return res.status(err.status).send(`Error: ${err.message}`);
  }
  // eslint-disable-next-line no-console
  console.error('Error:', err);
  res.status(500).send('Internal Server Error.');
};

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Now listening on port ${process.env.PORT}.`);
});
