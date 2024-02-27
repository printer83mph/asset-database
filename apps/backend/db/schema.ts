/* eslint-disable @typescript-eslint/no-use-before-define */

import { relations } from 'drizzle-orm';
import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { USER_SCHOOLS } from 'validation';

export const user = sqliteTable('user', {
  pennkey: text('pennkey').primaryKey(),
  hashedPassword: text('hashed_password').notNull(),
  salt: text('salt').notNull(),
  school: text('school', { enum: USER_SCHOOLS }).notNull(),
  name: text('name').notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  version: many(version),
}));

export const asset = sqliteTable('asset', {
  path: text('path').primaryKey(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  keywords: text('keywords'),
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
    reference: text('reference').notNull(),
    author: text('author')
      .references(() => user.pennkey)
      .notNull(),
    changes: text('changes').notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.assetPath, table.semver],
    }),
  }),
);

export const versionRelations = relations(version, ({ one }) => ({
  user: one(user, {
    fields: [version.author],
    references: [user.pennkey],
  }),
  asset: one(asset, {
    fields: [version.assetPath],
    references: [asset.path],
  }),
}));
