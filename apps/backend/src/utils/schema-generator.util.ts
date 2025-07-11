// utils/schema-generator.util.ts
import { z } from '@hono/zod-openapi';
import { ListQuerySchema } from '@/schemas/listQuery.schema';
import { analyzeRoute, HttpMethod } from './route-analyzer.util';
import { GetOneParamSchema } from '../schemas/getOneQuery.schema';

export const generateParamsSchema = (
  method: HttpMethod,
  path: string,
  resourceName: string,
) => {
  const analysis = analyzeRoute(method, path);

  if (!analysis.hasPathVariables) return undefined;

  if (analysis.isGetByIdRoute) {
    return GetOneParamSchema;
  }

  if (analysis.pathVariables.length === 1) {
    const paramName = analysis.pathVariables[0].replace(/[{}]/g, '');

    return z.object({
      [paramName]: z
        .string()
        .uuid()
        .openapi({
          description: `Unique identifier of the ${resourceName} resource`,
          example: '01957ff9-01b5-748f-a7ed-15efee52c158',
        }),
    });
  }

  return undefined;
};

export const generateQuerySchema = (
  method: HttpMethod,
  path: string,
  providedSchema?: z.ZodSchema,
) => {
  if (providedSchema) return providedSchema;

  const analysis = analyzeRoute(method, path);

  // Auto-apply ListQuerySchema for list routes
  if (analysis.isListRoute) {
    return ListQuerySchema;
  }

  return undefined;
};
