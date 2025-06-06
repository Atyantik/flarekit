import { BaseError, ErrorCategory } from './BaseError.class';

export class BusinessLogicError extends BaseError {
  readonly code: string;
  readonly status = 400;
  readonly category = ErrorCategory.BUSINESS_LOGIC;

  constructor(code: string, message: string, context?: Record<string, any>) {
    super(message, { context });
    this.code = code;
  }
}
