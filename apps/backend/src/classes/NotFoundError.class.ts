import { BaseError, ErrorCategory } from './BaseError.class';

export class NotFoundError extends BaseError {
  readonly code = 'RESOURCE_NOT_FOUND';
  readonly status = 404;
  readonly category = ErrorCategory.NOT_FOUND;

  constructor(resource: string, identifier: string) {
    super(`${resource} not found`, {
      context: { resource, identifier },
    });
  }
}
