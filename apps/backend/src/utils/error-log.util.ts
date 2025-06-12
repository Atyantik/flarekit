import { BaseError } from '@/classes/BaseError.class';
import { AppContext } from '@/types';
import { Context } from 'hono';

/**
 * Generates a unique request ID for error tracking
 */
export const generateRequestId = (): string => {
  if (globalThis.crypto?.randomUUID) {
    return `req_${globalThis.crypto.randomUUID()}`;
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

/**
 * Logs error with structured format for monitoring and debugging
 */
export const logError = (
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
  } else {
    console.warn('[APPLICATION ERROR]', JSON.stringify(logData, null, 2));
  }
};
