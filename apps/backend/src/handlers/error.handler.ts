import { BaseError } from '@/classes/BaseError.class';
import { ValidationError } from '@/classes/ValidationError.class';
import { SystemError } from '@/classes/SystemError.class';
import { AppContext } from '@/types';
import { Context, HonoRequest } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { ZodError } from 'zod';

const requestIdMap = new WeakMap<HonoRequest, string>();
/**
 * Generates a unique request ID for error tracking
 */
const generateRequestId = (c: Context<AppContext>): string => {
  const cfRequestId = c.req.header('cf-ray') || c.req.header('x-request-id');
  if (cfRequestId) {
    return cfRequestId;
  }
  const cachedRequestId = requestIdMap.get(c.req);
  if (cachedRequestId) {
    return cachedRequestId;
  }
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  requestIdMap.set(c.req, requestId);
  return requestId;
};

/**
 * Logs error with structured format for monitoring and debugging
 */
const logError = (
  error: BaseError,
  requestId: string,
  c: Context<AppContext>,
  options: { severe?: boolean } = {},
) => {
  const logData = {
    requestId,
    errorCode: error.code,
    category: error.category,
    status: error.status,
    message: error.message,
    details: error.details,
    context: error.context,
    timestamp: error.timestamp,
    request: {
      method: c.req.method,
      path: c.req.path,
      userAgent: c.req.header('user-agent'),
      ip: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for'),
    },
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack?.split('\n'),
    }),
  };

  if (options.severe || error.status >= 500) {
    console.error('[SEVERE ERROR]', JSON.stringify(logData, null, 2));
    // Here you could integrate with external error tracking (Sentry, etc.)
  } else {
    console.warn('[APPLICATION ERROR]', JSON.stringify(logData, null, 2));
  }
};

/**
 * Main error handler for the application
 * Handles all error types and provides consistent response format
 */
export const handleError = (ex: unknown, c: Context<AppContext>) => {
  const requestId = generateRequestId(c);

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
