/* eslint-disable @typescript-eslint/no-use-before-define */

import { relations } from 'drizzle-orm';
import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const asset = sqliteTable('asset', {
  path: text('path').primaryKey(),
  displayName: text('display_name').notNull(),
  description: text('description'),
});

export const assetRelations = relations(asset, ({ many }) => ({
  version: many(version),
}));

export const version = sqliteTable(
  'version',
  {
    assetPath: text('asset_path')
      .references(() => asset.path)
      .notNull(),
    semver: text('semver').notNull(),
    author: text('author').notNull(),
    keywords: text('keywords'),
    changes: text('changes').notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.assetPath, table.semver],
    }),
  }),
);

export const versionRelations = relations(version, ({ one }) => ({
  asset: one(asset, {
    fields: [version.assetPath],
    references: [asset.path],
  }),
}));