import { BaseError, ErrorCategory } from './BaseError.class';

export class AuthorizationError extends BaseError {
  readonly code = 'AUTHORIZATION_ERROR';
  readonly status = 403;
  readonly category = ErrorCategory.AUTHORIZATION;

  constructor(
    message: string = 'Access denied',
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

    // Allow custom error codes for specific authorization errors
    if (options.code) {
      (this as any).code = options.code;
    }
  }

  // Factory methods for common authorization errors
  static insufficientPermissions(
    resource?: string,
    action?: string,
    context?: Record<string, any>,
  ) {
    const message =
      resource && action
        ? `Insufficient permissions to ${action} ${resource}`
        : 'Insufficient permissions to perform this action';

    return new AuthorizationError(message, {
      code: 'INSUFFICIENT_PERMISSIONS',
      context: { resource, action, ...context },
    });
  }

  static accessDenied(resource?: string, context?: Record<string, any>) {
    const message = resource ? `Access denied to ${resource}` : 'Access denied';

    return new AuthorizationError(message, {
      code: 'ACCESS_DENIED',
      context: { resource, ...context },
    });
  }

  static roleRequired(
    requiredRole: string,
    userRole?: string,
    context?: Record<string, any>,
  ) {
    return new AuthorizationError(
      `${requiredRole} role required for this operation`,
      {
        code: 'ROLE_REQUIRED',
        context: { requiredRole, userRole, ...context },
      },
    );
  }

  static scopeInsufficient(
    requiredScopes: string[],
    userScopes?: string[],
    context?: Record<string, any>,
  ) {
    return new AuthorizationError('Insufficient scope for this operation', {
      code: 'SCOPE_INSUFFICIENT',
      context: { requiredScopes, userScopes, ...context },
    });
  }

  static resourceOwnershipRequired(
    resourceId?: string,
    userId?: string,
    context?: Record<string, any>,
  ) {
    return new AuthorizationError('You can only access resources you own', {
      code: 'RESOURCE_OWNERSHIP_REQUIRED',
      context: { resourceId, userId, ...context },
    });
  }

  static actionNotPermitted(
    action: string,
    resource?: string,
    context?: Record<string, any>,
  ) {
    const message = resource
      ? `Action '${action}' not permitted on ${resource}`
      : `Action '${action}' not permitted`;

    return new AuthorizationError(message, {
      code: 'ACTION_NOT_PERMITTED',
      context: { action, resource, ...context },
    });
  }

  static adminRequired(context?: Record<string, any>) {
    return new AuthorizationError('Administrator privileges required', {
      code: 'ADMIN_REQUIRED',
      context,
    });
  }

  static accountSuspended(reason?: string, context?: Record<string, any>) {
    const message = reason
      ? `Account suspended: ${reason}`
      : 'Account has been suspended';

    return new AuthorizationError(message, {
      code: 'ACCOUNT_SUSPENDED',
      context: { reason, ...context },
    });
  }

  static quotaExceeded(
    quotaType?: string,
    limit?: number,
    current?: number,
    context?: Record<string, any>,
  ) {
    const message = quotaType
      ? `${quotaType} quota exceeded`
      : 'Usage quota exceeded';

    return new AuthorizationError(message, {
      code: 'QUOTA_EXCEEDED',
      context: { quotaType, limit, current, ...context },
    });
  }

  static temporarilyRestricted(reason?: string, context?: Record<string, any>) {
    const message = reason
      ? `Access temporarily restricted: ${reason}`
      : 'Access temporarily restricted';

    return new AuthorizationError(message, {
      code: 'TEMPORARILY_RESTRICTED',
      context: { reason, ...context },
    });
  }
}
