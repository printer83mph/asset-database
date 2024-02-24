import { eq } from 'drizzle-orm';
import express from 'express';
import crypto from 'node:crypto';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import { user as userTable } from '../../db/schema';
import db from '../lib/database';

const authRouter = express.Router();

// passport local strategy
passport.use(
  new LocalStrategy(async (pennkey, password, cb) => {
    try {
      const users = await db
        .select()
        .from(userTable)
        .where(eq(userTable.pennkey, pennkey));
      if (users.length === 0)
        return cb(null, false, { message: 'Incorrect pennkey or password' });

      const [user] = users;

      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        'sha256',
        (err, hashedPassword) => {
          if (err) return cb(err);

          if (
            !crypto.timingSafeEqual(
              Buffer.from(user.hashedPassword),
              hashedPassword,
            )
          ) {
            return cb(null, false, {
              message: 'Incorrect pennkey or password',
            });
          }

          return cb(null, user);
        },
      );
    } catch (err) {
      return cb(err);
    }
  }),
);

authRouter.get('/login', passport.authenticate('local'));

export default authRouter;
