import { describe, it, expect } from 'vitest';
import { ServiceError } from '@/classes/service_error.class';

describe('ServiceError', () => {
  it('should create a ServiceError with status and message', () => {
    const error = new ServiceError(400, 'Bad Request');

    expect(error).toBeInstanceOf(ServiceError);
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Bad Request');
    expect(error.details).toEqual([]);
  });

  it('should create a ServiceError with status, message and details', () => {
    const details = ['Invalid input', 'Missing required field'];
    const error = new ServiceError(400, 'Bad Request', details);

    expect(error.status).toBe(400);
    expect(error.message).toBe('Bad Request');
    expect(error.details).toEqual(details);
  });

  it('should convert to JSON with all properties', () => {
    const details = ['Invalid input', 'Missing required field'];
    const error = new ServiceError(400, 'Bad Request', details);
    const json = error.toJSON();

    expect(json).toEqual({
      status: 400,
      message: 'Bad Request',
      details: details,
    });
  });

  it('should handle empty details array when not provided', () => {
    const error = new ServiceError(500, 'Internal Server Error');
    const json = error.toJSON();

    expect(json).toEqual({
      status: 500,
      message: 'Internal Server Error',
      details: [],
    });
  });
});
