import { BaseError, ErrorCategory } from './BaseError.class';

export class AuthenticationError extends BaseError {
  readonly code = 'AUTHENTICATION_ERROR';
  readonly status = 401;
  readonly category = ErrorCategory.AUTHENTICATION;

  constructor(
    message: string = 'Authentication failed',
    options: {
      code?: string;
      details?: Array<{
        field?: string;
        code?: string;
        message: string;
        value?: any;
      }>;
      context?: Record<string, any>;
      requestId?: string;
      cause?: Error;
    } = {},
  ) {
    super(message, {
      details: options.details,
      context: options.context,
      requestId: options.requestId,
      cause: options.cause,
    });

    // Allow custom error codes for specific authentication errors
    if (options.code) {
      (this as any).code = options.code;
    }
  }

  // Factory methods for common authentication errors
  static invalidCredentials(context?: Record<string, any>) {
    return new AuthenticationError('Invalid credentials provided', {
      code: 'INVALID_CREDENTIALS',
      context,
    });
  }

  static tokenExpired(context?: Record<string, any>) {
    return new AuthenticationError('Authentication token has expired', {
      code: 'TOKEN_EXPIRED',
      context,
    });
  }

  static tokenInvalid(context?: Record<string, any>) {
    return new AuthenticationError('Invalid authentication token', {
      code: 'TOKEN_INVALID',
      context,
    });
  }

  static missingCredentials(context?: Record<string, any>) {
    return new AuthenticationError('Authentication credentials are required', {
      code: 'MISSING_CREDENTIALS',
      context,
    });
  }

  static accountLocked(context?: Record<string, any>) {
    return new AuthenticationError(
      'Account is locked due to security reasons',
      {
        code: 'ACCOUNT_LOCKED',
        context,
      },
    );
  }

  static tooManyAttempts(context?: Record<string, any>) {
    return new AuthenticationError('Too many failed authentication attempts', {
      code: 'TOO_MANY_ATTEMPTS',
      context,
    });
  }
}
