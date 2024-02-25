declare module 'passport-json' {
  import { AuthorizeCallback, Strategy } from 'passport';

  export const Strategy: {
    new (
      opts: {
        usernameProp?: string;
        passwordProp?: string;
      },
      verify: (username, password, callback: AuthorizeCallback) => void,
    ): Strategy;
  };
}

declare module 'better-sqlite3-session-store' {
  import type BetterSQLite3 from 'better-sqlite3';
  import type session from 'express-session';

  export default function (sess: session): {
    new (opts: {
      client: BetterSQLite3.Database;
      expired: {
        clear: boolean;
        intervalMs: number; //ms = 15min
      };
    }): session.Store;
  };
}
