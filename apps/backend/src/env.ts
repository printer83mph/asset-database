import dotenv from 'dotenv';
import path from 'node:path';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      PORT: string | number;
      SECRET: string;
      NODE_ENV: 'production' | string;
    }
  }
}

export function populateEnv() {
  dotenv.config({ path: path.join(process.cwd(), '.env.local') });

  if (process.env.NODE_ENV !== 'production')
    dotenv.config({ path: '.env.development' });

  dotenv.config({ path: path.join(process.cwd(), '.env') });

  process.env.PORT = process.env.PORT ?? 8000;
  if (!process.env.SECRET) throw new Error('SECRET env variable not set!');
}
