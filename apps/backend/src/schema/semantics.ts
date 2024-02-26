import { z } from 'zod';

const PATH_SEGMENTS = 3;

export const pathSchema = z
  .string()
  .regex(
    new RegExp(`^[a-z0-9]+(:[a-z0-9]+){${PATH_SEGMENTS - 1}}$`),
    `Must be of shape x:x:x with ${PATH_SEGMENTS} segments`,
  );

export const semverSchema = z
  .string()
  .regex(/^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}$/, 'Must use shape x.x.x');
