import { NextFunction, Request, Response } from 'express';
import { ZodSchema, ZodTypeDef } from 'zod';

import CustomError from './custom-error';

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

export function withZod<TOutput, TInput = TOutput>(
  schema: ZodSchema<TOutput, ZodTypeDef, TInput>,
  cb: (data: TOutput, req: Request, res: Response, next: NextFunction) => void,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const response = await schema.safeParseAsync(req.body);

    if (!response.success)
      return next(
        new CustomError(
          400,
          `Invalid body.<br><br>${response.error.issues
            .map(
              ({ path, message }) =>
                `<code>${path.join('.')}</code>: ${message}.`,
            )
            .join('<br>')}`,
        ),
      );

    cb(response.data, req, res, next);
  };
}
