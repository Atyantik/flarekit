export abstract class BaseError extends Error {
  abstract readonly code: string;
  abstract readonly status: number;
  abstract readonly category: ErrorCategory;

  public readonly timestamp: string;
  public readonly requestId?: string;
  public readonly details: ErrorDetail[];
  public readonly context: Record<string, any>;

  constructor(
    message: string,
    options: {
      details?: ErrorDetail[];
      context?: Record<string, any>;
      requestId?: string;
      cause?: Error;
    } = {},
  ) {
    super(message, { cause: options.cause });
    this.timestamp = new Date().toISOString();
    this.details = options.details || [];
    this.context = options.context || {};
    this.requestId = options.requestId;
    this.name = this.constructor.name;
  }

  toJSON() {
    return {
      code: this.code,
      status: this.status,
      category: this.category,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      requestId: this.requestId,
      ...(process.env.NODE_ENV === 'development' && {
        context: this.context,
        stack: this.stack?.split('\n'),
      }),
    };
  }
}

export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  DATABASE = 'DATABASE',
  SYSTEM = 'SYSTEM',
}

export interface ErrorDetail {
  field?: string;
  code?: string;
  message: string;
  value?: any;
}
