// utils/api-builder.util.ts
import { createRoute, RouteConfig, RouteHandler, z } from '@hono/zod-openapi';
import { AppContext } from '@/types';
import { Context, Next } from 'hono';
import { OpenAPIHono } from '@hono/zod-openapi';
import { HeadersSchema } from '@/schemas/headers.scheme';
import { HttpMethod } from './route-analyzer.util';
import { generateApiSummary, generateResourceTags } from './api-docs.util';
import {
  generateParamsSchema,
  generateQuerySchema,
} from './schema-generator.util';
import { buildStandardResponses } from './response-builder.util';

type OpenAPIRouteConfig = Parameters<typeof createRoute>[0];

// This type represents what we expect from the user's config
type UserRequestSchemas = RouteConfig['request'];

// Utility types for full type safety
export type InferZod<T> = T extends z.ZodTypeAny ? z.infer<T> : never;

// Only include keys that are present and are Zod schemas
export type PresentKeys<T> = {
  [K in keyof T as T[K] extends z.ZodTypeAny ? K : never]: InferZod<T[K]>;
};

export type InferResponse<T extends z.ZodTypeAny> = z.infer<T>;

export interface ApiEndpointConfig<
  T extends z.ZodTypeAny,
  R extends UserRequestSchemas = UserRequestSchemas,
> extends Omit<OpenAPIRouteConfig, 'request'> {
  resource: string;
  method: HttpMethod;
  responseSchema: T;
  /**
   * Handler receives the standard Hono Context. Use HandlerParams<R>, HandlerQuery<R>, HandlerBody<R> for type safety.
   */
  handler: (
    c: Context<
      AppContext,
      any,
      {
        in: PresentKeys<R>;
        out: PresentKeys<R>;
      }
    >,
    next: Next,
  ) => Promise<InferResponse<T> | Response> | InferResponse<T> | Response;
  requiresAuth?: boolean;
  cache?: {
    enabled?: boolean;
    maxAge?: number;
    private?: boolean;
  };
  request?: R;
}

export const createApiEndpoint = <
  T extends z.ZodTypeAny,
  R extends UserRequestSchemas = UserRequestSchemas,
>(
  config: Omit<ApiEndpointConfig<T, R>, 'responses'>,
) => {
  const {
    resource,
    method,
    path,
    responseSchema,
    handler,
    summary,
    description,
    request,
    requiresAuth = false,
    cache = { enabled: false, maxAge: 0, private: true },
  } = config;

  // Generate schemas automatically if not provided
  const autoGeneratedParams = generateParamsSchema(method, path, resource);
  const autoGeneratedQuery = generateQuerySchema(method, path, request?.query);

  const responses = buildStandardResponses({
    method,
    path,
    resourceName: resource,
    responseSchema,
    requiresAuth,
  });

  const routeDefinition = createRoute({
    method,
    path,
    summary: summary || generateApiSummary(method, resource, path),
    description: description || generateApiSummary(method, resource, path),
    tags: generateResourceTags(resource),
    security: requiresAuth ? [{ Bearer: [] }] : undefined,
    request: {
      headers: requiresAuth ? HeadersSchema : undefined,
      body: request?.body as any,
      query: (request?.query || autoGeneratedQuery) as any,
      params: (request?.params || autoGeneratedParams) as any,
    },
    responses,
  });

  const wrappedHandler: RouteHandler<any, any> = async (c, next) => {
    const result = await handler(c, next);
    if (result instanceof Response) {
      if (cache.enabled) {
        result.headers.set(
          'Cache-Control',
          `max-age=${cache.maxAge}${cache.private ? ', private' : ''}`,
        );
      }
      return result;
    }
    // If result is not a Response, wrap it as JSON
    return c.json(result);
  };

  return (app: OpenAPIHono<AppContext>) => {
    app.openapi(routeDefinition, wrappedHandler);
  };
};
