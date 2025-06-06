import { BaseError, ErrorCategory } from './BaseError.class';

export class ValidationError extends BaseError {
  readonly code = 'VALIDATION_ERROR';
  readonly status = 400;
  readonly category = ErrorCategory.VALIDATION;

  constructor(message: string, fields: ValidationErrorDetail[]) {
    super(message, {
      details: fields.map((f) => ({
        field: f.field,
        code: f.code,
        message: f.message,
        value: f.value,
      })),
    });
  }
}

export interface ValidationErrorDetail {
  field?: string;
  code?: string;
  message: string;
  value?: any;
}
