import { BaseError, ErrorCategory } from './BaseError.class';

export class ExternalServiceError extends BaseError {
  readonly code = 'EXTERNAL_SERVICE_ERROR';
  readonly status = 502;
  readonly category = ErrorCategory.EXTERNAL_SERVICE;

  constructor(
    message: string = 'External service error',
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

    // Allow custom error codes for specific external service errors
    if (options.code) {
      (this as any).code = options.code;
    }
  }

  // Factory methods for common external service errors
  static serviceUnavailable(
    serviceName: string,
    context?: Record<string, any>,
  ) {
    return new ExternalServiceError(
      `${serviceName} service is currently unavailable`,
      {
        code: 'SERVICE_UNAVAILABLE',
        context: { serviceName, ...context },
      },
    );
  }

  static timeout(
    serviceName: string,
    timeoutMs?: number,
    context?: Record<string, any>,
  ) {
    const message = timeoutMs
      ? `${serviceName} request timed out after ${timeoutMs}ms`
      : `${serviceName} request timed out`;

    return new ExternalServiceError(message, {
      code: 'SERVICE_TIMEOUT',
      context: { serviceName, timeoutMs, ...context },
    });
  }

  static rateLimited(
    serviceName: string,
    retryAfter?: number,
    context?: Record<string, any>,
  ) {
    const message = retryAfter
      ? `${serviceName} rate limit exceeded. Retry after ${retryAfter} seconds`
      : `${serviceName} rate limit exceeded`;

    return new ExternalServiceError(message, {
      code: 'SERVICE_RATE_LIMITED',
      context: { serviceName, retryAfter, ...context },
    });
  }

  static invalidResponse(
    serviceName: string,
    expectedFormat?: string,
    context?: Record<string, any>,
  ) {
    const message = expectedFormat
      ? `${serviceName} returned invalid response format. Expected: ${expectedFormat}`
      : `${serviceName} returned invalid response format`;

    return new ExternalServiceError(message, {
      code: 'INVALID_RESPONSE_FORMAT',
      context: { serviceName, expectedFormat, ...context },
    });
  }

  static authenticationFailed(
    serviceName: string,
    context?: Record<string, any>,
  ) {
    return new ExternalServiceError(
      `Authentication failed with ${serviceName}`,
      {
        code: 'SERVICE_AUTH_FAILED',
        context: { serviceName, ...context },
      },
    );
  }

  static configurationError(
    serviceName: string,
    missingConfig?: string,
    context?: Record<string, any>,
  ) {
    const message = missingConfig
      ? `${serviceName} configuration error: ${missingConfig} is missing or invalid`
      : `${serviceName} configuration error`;

    return new ExternalServiceError(message, {
      code: 'SERVICE_CONFIG_ERROR',
      context: { serviceName, missingConfig, ...context },
    });
  }

  static networkError(
    serviceName: string,
    networkCode?: string,
    context?: Record<string, any>,
  ) {
    const message = networkCode
      ? `Network error connecting to ${serviceName}: ${networkCode}`
      : `Network error connecting to ${serviceName}`;

    return new ExternalServiceError(message, {
      code: 'NETWORK_ERROR',
      context: { serviceName, networkCode, ...context },
    });
  }

  static quotaExceeded(
    serviceName: string,
    quotaType?: string,
    context?: Record<string, any>,
  ) {
    const message = quotaType
      ? `${serviceName} ${quotaType} quota exceeded`
      : `${serviceName} quota exceeded`;

    return new ExternalServiceError(message, {
      code: 'SERVICE_QUOTA_EXCEEDED',
      context: { serviceName, quotaType, ...context },
    });
  }

  static versionMismatch(
    serviceName: string,
    expectedVersion?: string,
    actualVersion?: string,
    context?: Record<string, any>,
  ) {
    const message =
      expectedVersion && actualVersion
        ? `${serviceName} API version mismatch. Expected: ${expectedVersion}, Got: ${actualVersion}`
        : `${serviceName} API version mismatch`;

    return new ExternalServiceError(message, {
      code: 'API_VERSION_MISMATCH',
      context: { serviceName, expectedVersion, actualVersion, ...context },
    });
  }

  static malformedRequest(
    serviceName: string,
    reason?: string,
    context?: Record<string, any>,
  ) {
    const message = reason
      ? `${serviceName} rejected request: ${reason}`
      : `${serviceName} rejected malformed request`;

    return new ExternalServiceError(message, {
      code: 'MALFORMED_REQUEST',
      context: { serviceName, reason, ...context },
    });
  }

  static partialFailure(
    serviceName: string,
    successCount: number,
    failureCount: number,
    context?: Record<string, any>,
  ) {
    return new ExternalServiceError(
      `${serviceName} partial failure: ${successCount} succeeded, ${failureCount} failed`,
      {
        code: 'PARTIAL_FAILURE',
        context: { serviceName, successCount, failureCount, ...context },
      },
    );
  }

  static circuitBreakerOpen(
    serviceName: string,
    context?: Record<string, any>,
  ) {
    return new ExternalServiceError(
      `${serviceName} circuit breaker is open due to repeated failures`,
      {
        code: 'CIRCUIT_BREAKER_OPEN',
        context: { serviceName, ...context },
      },
    );
  }

  static maintenanceMode(
    serviceName: string,
    estimatedDuration?: string,
    context?: Record<string, any>,
  ) {
    const message = estimatedDuration
      ? `${serviceName} is in maintenance mode. Estimated duration: ${estimatedDuration}`
      : `${serviceName} is in maintenance mode`;

    return new ExternalServiceError(message, {
      code: 'SERVICE_MAINTENANCE',
      context: { serviceName, estimatedDuration, ...context },
    });
  }

  static webhookDeliveryFailed(
    serviceName: string,
    webhookUrl?: string,
    attempt?: number,
    context?: Record<string, any>,
  ) {
    const message =
      webhookUrl && attempt
        ? `Failed to deliver webhook to ${serviceName} at ${webhookUrl} (attempt ${attempt})`
        : `Failed to deliver webhook to ${serviceName}`;

    return new ExternalServiceError(message, {
      code: 'WEBHOOK_DELIVERY_FAILED',
      context: { serviceName, webhookUrl, attempt, ...context },
    });
  }
}
