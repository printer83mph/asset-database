import { TRPCError, initTRPC } from '@trpc/server';
import type { Context } from './router';

const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const authedProcedure = publicProcedure.use(async (opts) => {
  const { user } = opts.ctx.express.req.session;
  if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });

  return opts.next({
    ctx: { ...opts.ctx, user },
  });
});
