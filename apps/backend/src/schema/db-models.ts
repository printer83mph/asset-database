import { ZodTypeDef, z } from 'zod';
import { asset, version } from '../../db/schema';
import { pathSchema } from './semantics';

// --------- ---------  ASSETS --------- ---------

const NAME_MIN_LENGTH = 4;

export const assetInsertSchema = z.object({
  path: pathSchema,
  displayName: z
    .string()
    .min(NAME_MIN_LENGTH, `Must be at least ${NAME_MIN_LENGTH} characters`)
    .trim(),
  description: z.string().nullish(),
}) satisfies z.ZodSchema<typeof asset.$inferInsert>;

// --------- ---------  ASSET VERSIONS --------- ---------

export const parseVersionSelect = ({
  keywords,
  ...versionSelect
}: typeof version.$inferSelect) => ({
  keywords: keywords?.split(',').map((keyword) => keyword.trim()),
  ...versionSelect,
});

export type Version = Omit<
  ReturnType<typeof parseVersionSelect>,
  'keywords'
> & {
  keywords?: string[];
};

export const versionInsertSchema = z.object({
  assetPath: z.string(),
  semver: z
    .string()
    .regex(/^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}$/, 'Must use shape x.x.x'),
  author: z.string().min(1, 'Cannot be empty'),
  keywords: z
    .array(z.string())
    .optional()
    .transform((keywords) =>
      keywords?.map((keyword) => keyword.trim()).join(','),
    ),
  changes: z.string(),
}) satisfies z.ZodSchema<typeof version.$inferInsert, ZodTypeDef, Version>;
