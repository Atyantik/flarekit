import { z } from '@hono/zod-openapi';

export const ErrorDetailSchema = z.object({
  field: z.string().optional(),
  code: z.string().optional(),
  message: z.string(),
  value: z.any().optional(),
});

export const BaseErrorSchema = z.object({
  code: z.string(),
  status: z.number(),
  category: z.string(),
  message: z.string(),
  details: z.array(ErrorDetailSchema).optional(),
  timestamp: z.string(),
  requestId: z.string().optional(),
  context: z.record(z.any()).optional(),
  stack: z.array(z.string()).optional(), // Only present in development
});

export const ValidationErrorSchema = BaseErrorSchema.extend({
  code: z.string().default('VALIDATION_ERROR'),
  status: z.number().default(400),
  category: z.string().default('VALIDATION'),
}).openapi('Error.ValidationError', {});

export const AuthenticationErrorSchema = BaseErrorSchema.extend({
  code: z.string().default('AUTHENTICATION_ERROR'),
  status: z.number().default(401),
  category: z.string().default('AUTHENTICATION'),
}).openapi('Error.AuthenticationError', {});

export const AuthorizationErrorSchema = BaseErrorSchema.extend({
  code: z.string().default('AUTHORIZATION_ERROR'),
  status: z.number().default(403),
  category: z.string().default('AUTHORIZATION'),
}).openapi('Error.AuthorizationError', {});

export const NotFoundErrorSchema = BaseErrorSchema.extend({
  code: z.string().default('RESOURCE_NOT_FOUND'),
  status: z.number().default(404),
  category: z.string().default('NOT_FOUND'),
}).openapi('Error.NotFoundError', {});

export const BusinessLogicErrorSchema = BaseErrorSchema.extend({
  code: z.string().default('BUSINESS_LOGIC_ERROR'),
  status: z.number().default(400),
  category: z.string().default('BUSINESS_LOGIC'),
}).openapi('Error.BusinessLogicError', {});

export const ExternalServiceErrorSchema = BaseErrorSchema.extend({
  code: z.string().default('EXTERNAL_SERVICE_ERROR'),
  status: z.number().default(502),
  category: z.string().default('EXTERNAL_SERVICE'),
}).openapi('Error.ExternalServiceError', {});

export const DatabaseErrorSchema = BaseErrorSchema.extend({
  code: z.string().default('DATABASE_ERROR'),
  status: z.number().default(500),
  category: z.string().default('DATABASE'),
}).openapi('Error.DatabaseError', {});

export const SystemErrorSchema = BaseErrorSchema.extend({
  code: z.string().default('SYSTEM_ERROR'),
  status: z.number().default(500),
  category: z.string().default('SYSTEM'),
}).openapi('Error.SystemError', {});
