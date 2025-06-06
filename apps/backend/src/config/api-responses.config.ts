// config/api-responses.config.ts
export const HTTP_STATUS_CODES = {
  GET: 200,
  POST: 201,
  PUT: 200,
  PATCH: 200,
  DELETE: 204,
  OPTIONS: 204,
  HEAD: 200,
  TRACE: 200,
} as const;

export const ERROR_RESPONSE_CONFIGS = {
  VALIDATION: { status: 400, description: 'Validation Error' },
  UNAUTHORIZED: { status: 401, description: 'Unauthorized Access' },
  FORBIDDEN: { status: 403, description: 'Forbidden' },
  NOT_FOUND: { status: 404, description: 'Resource Not Found' },
  CONFLICT: { status: 409, description: 'Conflict' },
  SERVER_ERROR: { status: 500, description: 'Internal Server Error' },
} as const;

export const STANDARD_ERROR_RESPONSES = {
  400: {
    description: ERROR_RESPONSE_CONFIGS.VALIDATION.description,
    content: {
      'application/json': {
        schema: 'BadRequestErrorSchema', // Will be replaced by actual schema
      },
    },
  },
  401: {
    description: ERROR_RESPONSE_CONFIGS.UNAUTHORIZED.description,
    content: {
      'application/json': {
        schema: 'UnauthorizedErrorSchema',
      },
    },
  },
  403: {
    description: ERROR_RESPONSE_CONFIGS.FORBIDDEN.description,
    content: {
      'application/json': {
        schema: 'ForbiddenErrorSchema',
      },
    },
  },
  404: {
    description: ERROR_RESPONSE_CONFIGS.NOT_FOUND.description,
    content: {
      'application/json': {
        schema: 'NotFoundErrorSchema',
      },
    },
  },
  409: {
    description: ERROR_RESPONSE_CONFIGS.CONFLICT.description,
    content: {
      'application/json': {
        schema: 'ConflictErrorSchema',
      },
    },
  },
  500: {
    description: ERROR_RESPONSE_CONFIGS.SERVER_ERROR.description,
    content: {
      'application/json': {
        schema: 'ServerErrorSchema',
      },
    },
  },
} as const;
