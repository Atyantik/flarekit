import { BaseError } from '@/classes/BaseError.class';
import { ValidationError } from '@/classes/ValidationError.class';
import { SystemError } from '@/classes/SystemError.class';
import { AppContext } from '@/types';
import { Context } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { ZodError } from 'zod';
import { generateRequestId, logError } from '@utils/error-log.util';

/**
 * Main error handler for the application
 * Handles all error types and provides consistent response format
 */
export const handleError = (ex: unknown, c: Context<AppContext>) => {
  const requestId = generateRequestId();

  // Handle our custom unified errors
  if (ex instanceof BaseError) {
    // Set request ID if not already set
    if (!ex.requestId) {
      (ex as any).requestId = requestId;
    }

    logError(ex, requestId, c);
    return c.json(ex.toJSON(), ex.status as ContentfulStatusCode);
  }

  // Handle Zod validation errors
  if (
    ex instanceof ZodError ||
    (typeof ex === 'object' &&
      ex !== null &&
      'name' in ex &&
      ex.name === 'ZodError')
  ) {
    const zodError = ex as ZodError;
    const validationError = new ValidationError(
      'Request validation failed',
      zodError.issues.map((issue) => ({
        field: issue.path.join('.'),
        code: issue.code.toUpperCase(),
        message: issue.message,
        value: 'received' in issue ? issue.received : undefined,
      })),
    );

    // Set request ID and context
    (validationError as any).requestId = requestId;
    validationError.context.zodIssues = zodError.issues;

    logError(validationError, requestId, c);
    return c.json(
      validationError.toJSON(),
      validationError.status as ContentfulStatusCode,
    );
  }

  // Handle unexpected errors (convert to SystemError)
  const systemError = new SystemError('An unexpected error occurred', {
    code: 'UNEXPECTED_ERROR',
    cause: ex instanceof Error ? ex : new Error(String(ex)),
    requestId,
    context: {
      originalError:
        ex instanceof Error
          ? {
              name: ex.name,
              message: ex.message,
              stack: ex.stack,
            }
          : {
              type: typeof ex,
              value: String(ex),
            },
    },
  });

  logError(systemError, requestId, c, { severe: true });

  // Return safe error response (without sensitive internal details in production)
  const response = systemError.toJSON();
  if (process.env.NODE_ENV === 'production') {
    // Remove sensitive information in production
    delete response.context;
    delete response.stack;
  }

  return c.json(response, systemError.status as ContentfulStatusCode);
};
