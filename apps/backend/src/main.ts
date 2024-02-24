import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';

import assetRouter from './routes/asset';
import authRouter from './routes/auth';

dotenv.config();
const PORT = process.env.PORT ?? 8000;

const app = express();

app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/asset', assetRouter);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Now listening on port ${PORT}.`);
});
