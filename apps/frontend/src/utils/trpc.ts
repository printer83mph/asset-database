import { httpBatchLink } from '@trpc/client';
import { createSWRProxyHooks } from '@trpc-swr/client';
import type { AppRouter } from 'backend/src/router';

export const trpc = createSWRProxyHooks<AppRouter>({
  links: [
    httpBatchLink({
      url: `/api/trpc`,
    }),
  ],
});
