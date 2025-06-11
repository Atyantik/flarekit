import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import type { AppContext } from '@/types';
import { handleError } from '@/handlers/error.handler';

/**
 * OpenAPI configuration object that defines the API specification version and metadata.
 * This configuration is used to generate the OpenAPI documentation.
 */
export const openApiConfig = {
  openapi: '3.1.1',
  info: {
    version: '1.0.1',
    title: 'Flarekit API',
    description: 'Flarekit API Documentation', // You could add more metadata
  },
};

export const SPECIFICATION_ENDPOINT = '/specification.json';

export const DOCS_ENDPOINT = '/docs';

/**
 * Registers common OpenAPI components (e.g., security schemes) to the app's registry.
 * This function sets up authentication schemes and other reusable components that can be
 * referenced throughout the API documentation.
 *
 * @param {OpenAPIHono<AppContext>} app - The OpenAPIHono app instance to register components with
 */
export function registerOpenAPIComponents(app: OpenAPIHono<AppContext>) {
  app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
    type: 'http',
    scheme: 'bearer',
  });
}

/**
 * Sets up OpenAPI documentation endpoints on the app.
 * This function configures two endpoints:
 * 1. /specification.json - Serves the OpenAPI specification
 * 2. /docs - Serves the Swagger UI interface for API documentation
 *
 * @param {OpenAPIHono<AppContext>} app - The OpenAPIHono app instance to set up documentation for
 */
export function setupOpenAPIDocs(app: OpenAPIHono<AppContext>) {
  app.doc31(SPECIFICATION_ENDPOINT, openApiConfig);

  app.get(
    DOCS_ENDPOINT,
    swaggerUI({
      url: SPECIFICATION_ENDPOINT,
      persistAuthorization: true,
    }),
  );
}

/**
 * Creates an OpenAPI-enabled Hono app with default error handling.
 * This function initializes a new OpenAPIHono instance with custom error handling hooks.
 *
 * @returns {OpenAPIHono<AppContext>} A configured OpenAPIHono instance with error handling
 */
export function createOpenAPIApp(): OpenAPIHono<AppContext> {
  const app = new OpenAPIHono<AppContext>({
    defaultHook: (result, c) => {
      if (!result.success) {
        return handleError(result.error, c);
      }
    },
  });
  app.onError((err, c) => {
    return handleError(err, c);
  });
  registerOpenAPIComponents(app);
  setupOpenAPIDocs(app);
  return app;
}
