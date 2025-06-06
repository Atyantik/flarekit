// utils/response-builder.util.ts
import { z } from 'zod';
import { HTTP_STATUS_CODES } from '@/config/api-responses.config';
import {
  ValidationErrorSchema,
  AuthenticationErrorSchema,
  AuthorizationErrorSchema,
  NotFoundErrorSchema,
  BusinessLogicErrorSchema,
  ExternalServiceErrorSchema,
  SystemErrorSchema,
} from '@/schemas/error.schema';
import { HttpMethod, analyzeRoute } from './route-analyzer.util';
import { generateApiDescription } from './api-docs.util';

const ERROR_SCHEMA_MAP = {
  400: ValidationErrorSchema,
  401: AuthenticationErrorSchema,
  403: AuthorizationErrorSchema,
  404: NotFoundErrorSchema,
  409: BusinessLogicErrorSchema,
  500: SystemErrorSchema,
  502: ExternalServiceErrorSchema,
} as const;

export interface ResponseBuilderOptions {
  method: HttpMethod;
  path: string;
  resourceName: string;
  responseSchema: z.ZodSchema;
  requiresAuth: boolean;
}

export const buildStandardResponses = (options: ResponseBuilderOptions) => {
  const { method, path, resourceName, responseSchema, requiresAuth } = options;
  const analysis = analyzeRoute(method, path);
  const successStatus =
    HTTP_STATUS_CODES[method.toUpperCase() as keyof typeof HTTP_STATUS_CODES];

  const responses: Record<string, any> = {
    [successStatus]: {
      description: generateApiDescription(method, resourceName, path),
      content: {
        'application/json': {
          schema: responseSchema,
        },
      },
    },
    400: {
      description: 'Bad Request',
      content: {
        'application/json': {
          schema: ERROR_SCHEMA_MAP[400],
        },
      },
    },
    409: {
      description: 'Conflict',
      content: {
        'application/json': {
          schema: ERROR_SCHEMA_MAP[409],
        },
      },
    },
    500: {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: ERROR_SCHEMA_MAP[500],
        },
      },
    },
    502: {
      description: 'Bad Gateway (External Service Error)',
      content: {
        'application/json': {
          schema: ERROR_SCHEMA_MAP[502],
        },
      },
    },
  };

  // Add auth-related errors if authentication is required
  if (requiresAuth) {
    responses[401] = {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: ERROR_SCHEMA_MAP[401],
        },
      },
    };
    responses[403] = {
      description: 'Forbidden',
      content: {
        'application/json': {
          schema: ERROR_SCHEMA_MAP[403],
        },
      },
    };
  }

  // Add 404 only for routes that target specific resources
  if (
    analysis.isGetByIdRoute ||
    analysis.isUpdateRoute ||
    analysis.isDeleteRoute
  ) {
    responses[404] = {
      description: 'Not Found',
      content: {
        'application/json': {
          schema: ERROR_SCHEMA_MAP[404],
        },
      },
    };
  }

  return responses;
};
