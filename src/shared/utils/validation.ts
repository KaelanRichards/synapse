import { z } from 'zod';
import { APIError } from '../errors/APIError';

/**
 * Validates data against a Zod schema and returns the validated data
 * or throws an APIError with validation details
 */
export async function validateData<T>(
  schema: z.Schema<T>,
  data: unknown
): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError('Validation failed', 'VALIDATION_ERROR', {
        field: error.errors[0]?.path.join('.'),
        details: {
          errors: error.errors.map(err => ({
            path: err.path,
            message: err.message,
          })),
        },
      });
    }
    throw error;
  }
}

/**
 * Type guard to check if a value matches a Zod schema
 */
export function isValid<T>(schema: z.Schema<T>, data: unknown): data is T {
  return schema.safeParse(data).success;
}
