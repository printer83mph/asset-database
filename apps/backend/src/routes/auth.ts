import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { z } from 'zod';

import { user as userTable } from '../../db/schema';
import db from '../lib/database';
import { pick } from '../lib/util';
import { authedProcedure, publicProcedure, router } from '../trpc';
import { UserSchool } from 'validation/src/semantics';
import { userSchema } from 'validation/src/db-models';

const pbkdf2 = promisify(crypto.pbkdf2);

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

// actual router
const authRouter = router({
  me: authedProcedure
    .meta({ openapi: { method: 'GET', path: '/auth' } })
    .query(({ ctx }) => {
      return ctx.user;
    }),
  login: publicProcedure
    .meta({ openapi: { method: 'POST', path: '/auth/login' } })
    .input(z.object({ pennkey: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input: { pennkey, password } }) => {
      // find user in DB
      const users = await db
        .select()
        .from(userTable)
        .where(eq(userTable.pennkey, pennkey));

      if (users.length === 0)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Incorrect pennkey or password',
        });

      const [user] = users;

      // salt and hash input password
      let hashedPassword: Buffer;
      try {
        hashedPassword = await pbkdf2(
          password,
          Buffer.from(user.salt, 'base64'),
          310000,
          32,
          'sha256',
        );
      } catch (err) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      // see if hashed passwords match
      if (
        !crypto.timingSafeEqual(
          Buffer.from(user.hashedPassword, 'base64'),
          hashedPassword,
        )
      )
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Incorrect pennkey or password',
        });

      // update session
      const userSessionInfo = pick(user, ['pennkey', 'school']);
      ctx.express.req.session.user = userSessionInfo;

      return userSessionInfo;
    }),
  logout: authedProcedure
    .meta({ openapi: { method: 'POST', path: '/auth/logout' } })
    .mutation(({ ctx }) => {
      const { session } = ctx.express.req;
      session.user = undefined;
    }),
  signup: publicProcedure
    .meta({ openapi: { method: 'POST', path: '/auth/signup' } })
    .input(userSchema)
    .mutation(async ({ input }) => {
      // salt and hash password
      const salt = crypto.randomBytes(16);
      let hashedPassword: Buffer;
      try {
        hashedPassword = await pbkdf2(
          input.password,
          salt,
          310000,
          32,
          'sha256',
        );
      } catch (err) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      // add user to DB
      const result = await db
        .insert(userTable)
        .values({
          ...input,
          hashedPassword: hashedPassword.toString('base64'),
          salt: salt.toString('base64'),
        })
        .onConflictDoNothing();
      if (result.changes === 0)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'The provided pennkey is already taken',
        });

      const { pennkey, school } = input;
      return { pennkey, school };
    }),
});

export default authRouter;
