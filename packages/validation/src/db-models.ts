import { z } from 'zod';
import { USER_SCHOOLS, pathSchema, semverSchema } from './semantics';

const NAME_MIN_LENGTH = 4;
const NAME_MAX_LENGTH = 36;

const DISPLAY_NAME_MIN_LENGTH = 4;

export const userSchema = z.object({
  pennkey: z.string().min(1, 'Cannot be empty').trim(),
  password: z.string().min(8, 'Must be at least 8 characters'),
  name: z
    .string()
    .min(NAME_MIN_LENGTH, 'Cannot be empty')
    .regex(/^[A-Za-z ]+$/)
    .max(NAME_MAX_LENGTH)
    .trim(),
  school: z.enum(USER_SCHOOLS),
});

export const assetSchema = z.object({
  path: pathSchema,
  semver: semverSchema,
  displayName: z
    .string()
    .min(
      DISPLAY_NAME_MIN_LENGTH,
      `Must be at least ${DISPLAY_NAME_MIN_LENGTH} characters`,
    )
    .trim(),
  description: z.string().nullish(),
});

export const versionSchema = z.object({
  assetPath: pathSchema,
  semver: semverSchema,
  author: z.string().min(1, 'Cannot be empty'),
  keywords: z
    .array(z.string())
    .or(z.undefined())
    .transform((keywords) =>
      keywords?.map((keyword) => keyword.trim()).join(','),
    ),
  changes: z.string(),
});
