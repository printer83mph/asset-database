import { ZodError } from 'zod';

export function pick<T, TKeys extends keyof T>(
  object: T,
  keys: TKeys[],
): Pick<T, TKeys> {
  return keys.reduce(
    (obj, key) => {
      if (object && Object.prototype.hasOwnProperty.call(object, key)) {
        obj[key] = object[key];
      }
      return obj;
    },
    {} as Pick<T, TKeys>,
  );
}

export function formatZodError(error: ZodError) {
  return `Invalid body.<br><br>${error.issues
    .map(({ path, message }) => `<code>${path.join('.')}</code>: ${message}.`)
    .join('<br>')}`;
}
