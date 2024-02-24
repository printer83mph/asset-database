import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './assets.db',
  },
  out: './drizzle',
  verbose: true,
  strict: true,
});
