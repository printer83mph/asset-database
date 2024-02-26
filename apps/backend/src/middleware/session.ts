import bsqlite3store from 'better-sqlite3-session-store';
import type { Express } from 'express';
import session, { Session } from 'express-session';

import { UserSchool } from '../../db/schema';
import { sqlite } from '../lib/database';

// extend session object with user field
declare module 'express' {
  export interface Request {
    session: Session & {
      user?: {
        pennkey: string;
        school: UserSchool;
      };
    };
  }
}

const SQLiteStore = bsqlite3store(session);

const sessionMiddleware = (app: Express) => {
  const sess = {
    store: new SQLiteStore({
      client: sqlite,
      expired: {
        clear: true,
        intervalMs: 900000, //ms = 15min
      },
    }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false as boolean },
  } satisfies session.SessionOptions;

  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line no-console
    console.log('Running server in production mode.');
    app.set('trust proxy', 1); // trust first proxy
    sess.cookie.secure = true; // serve secure cookies
  }

  return session(sess);
};

export default sessionMiddleware;
