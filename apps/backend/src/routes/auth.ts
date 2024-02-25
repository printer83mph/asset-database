import { eq } from 'drizzle-orm';
import express from 'express';
import crypto from 'node:crypto';
import passport from 'passport';
import { Strategy as JsonStrategy } from 'passport-json';

import { z } from 'zod';
import { USER_SCHOOLS, UserSchool, user as userTable } from '../../db/schema';
import CustomError from '../lib/custom-error';
import db from '../lib/database';
import { pick, withZod } from '../lib/util';

// augment express.User with info
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      pennkey: string;
      school: UserSchool;
    }
  }
}

// serialization/deserialization
passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(
      null,
      pick(user as RetrievedUser, ['pennkey', 'school']) satisfies Express.User,
    );
  });
});

passport.deserializeUser((user: Express.User, cb) => {
  process.nextTick(() => {
    return cb(null, user);
  });
});

type RetrievedUser = typeof userTable.$inferSelect;

// passport json strategy
passport.use(
  new JsonStrategy(
    { usernameProp: 'pennkey' },
    async (pennkey, password, callback) => {
      try {
        // find user in DB
        const users = await db
          .select()
          .from(userTable)
          .where(eq(userTable.pennkey, pennkey));
        if (users.length === 0)
          return callback(null, false, {
            message: 'Incorrect pennkey or password',
          });

        const [user] = users;

        // salt and hash
        crypto.pbkdf2(
          password,
          Buffer.from(user.salt, 'base64'),
          310000,
          32,
          'sha256',
          (err, hashedPassword) => {
            if (err) return callback(err);

            if (
              !crypto.timingSafeEqual(
                Buffer.from(user.hashedPassword, 'base64'),
                hashedPassword,
              )
            ) {
              return callback(null, false, {
                message: 'Incorrect pennkey or password',
              });
            }

            return callback(null, user satisfies RetrievedUser);
          },
        );
      } catch (err) {
        return callback(err);
      }
    },
  ),
);

// actual router
const authRouter = express.Router();

authRouter.get('/', (req, res, next) => {
  if (!req.user) return next(new CustomError(401, 'Not logged in'));
  res.json(req.user);
});

// authRouter.post('/login', passport.authenticate('json'));

authRouter.post('/login', (req, res, next) => {
  passport.authenticate(
    'json',
    (err: unknown, user: Express.User, info: string, status: number = 500) => {
      if (err)
        return next(new CustomError(status, info ?? 'Something went wrong'));

      if (!user) return next(new CustomError(400, 'Could not log in'));
      res.send(`Successfully logged in as ${user.pennkey}`);
    },
  )(req, res, next);
});

authRouter.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.send('Successfully logged out!');
  });
});

const signupSchema = z.object({
  pennkey: z.string().min(1, 'Cannot be empty').trim(),
  password: z.string().min(8, 'Must be at least 8 characters'),
  name: z
    .string()
    .min(1, 'Cannot be empty')
    .regex(/^[A-Za-z ]+$/)
    .trim(),
  school: z.enum(USER_SCHOOLS),
});

authRouter.post(
  '/signup',
  withZod(
    signupSchema,
    async ({ pennkey, password, name, school }, _req, res, next) => {
      // salt and hash password
      const salt = crypto.randomBytes(16);
      crypto.pbkdf2(
        password,
        salt,
        310000,
        32,
        'sha256',
        async (err, hashedPassword) => {
          if (err) return next(err);

          const result = await db
            .insert(userTable)
            .values({
              pennkey,
              name,
              school,
              hashedPassword: hashedPassword.toString('base64'),
              salt: salt.toString('base64'),
            })
            .onConflictDoNothing();
          if (result.changes === 0)
            return next(
              new CustomError(400, 'The provided pennkey is already taken'),
            );

          res.send(`Successfully created user with pennkey ${pennkey}!`);
        },
      );
    },
  ),
);

export default authRouter;
