import { z } from 'zod';

const PATH_SEGMENTS = 3;

export const USER_SCHOOLS = ['cas', 'seas', 'wharton', 'none'] as const;
export type UserSchool = (typeof USER_SCHOOLS)[number];

export const DEFAULT_SEMVER = '1.0.0';

export const semverSchema = z
  .string()
  .regex(/^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}$/, 'Must use shape x.x.x');

export const pathSchema = z
  .string()
  .regex(
    new RegExp(`^[a-z0-9]+(:[a-z0-9]+){${PATH_SEGMENTS - 1}}$`),
    `Must be of shape x:x:x with ${PATH_SEGMENTS} segments`,
  );
