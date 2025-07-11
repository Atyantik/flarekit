# Flarekit Backend Service

This directory contains the backend APIs implemented with **[Hono](https://hono.dev/)** and exposed through Cloudflare Workers. The service provides REST endpoints, scheduled jobs, and queue consumers. API routes automatically generate an OpenAPI specification for easy documentation and client generation.

## Overview of the API Architecture

- **Entry Point**: `src/index.ts` creates an OpenAPI-enabled Hono app via `createOpenAPIApp()`. It registers global middleware (like CORS) and mounts every versioned route collection.
- **Route Definition**: Each route is defined in `src/routes`. Version folders (e.g., `v1`) contain resource specific files.
- **Workers Features**: Besides the HTTP `fetch` handler, the worker exposes `queue` and `scheduled` handlers implemented in `src/handlers`.
- **OpenAPI Docs**: The app exposes `/specification.json` and `/docs` endpoints for the generated specification and Swagger UI.

## `createApiEndpoint` Workflow

Routes are defined with the `createApiEndpoint` helper in `src/utils/api-builder.util.ts`. This function wraps a Hono route and automatically:

1. Generates parameter and query schemas using Zod.
2. Builds standard success and error responses.
3. Wraps the handler to return JSON and sets optional caching headers.
4. Registers the route with OpenAPI metadata so it appears in the documentation.

Example usage:

```ts
export const storageListEndpoint = createApiEndpoint({
  resource: 'Storage',
  method: 'get',
  path: '/api/v1/storage',
  responseSchema: z.array(StorageRecordSchema),
  request: {
    headers: HeadersSchema,
    query: ListQuerySchema,
  },
  handler: async (c) => {
    const db = initDBInstance(c.env, c.env);
    const query = c.req.valid('query');
    // ...business logic...
    return c.json([]);
  },
});
```

## REST API Conventions

The backend endpoints implement the dialect used by
[`ra-data-simple-rest`](https://github.com/marmelab/react-admin/tree/master/packages/ra-data-simple-rest).
List requests accept three query parameters and must include a `Content-Range`
header for pagination:

- `sort` – JSON array `["field","ASC"|"DESC"]`
- `range` – zero-based `[start, end]` indices
- `filter` – JSON object with filter values

Responses follow the HTTP method semantics defined in
[RFC&nbsp;9110](https://www.rfc-editor.org/rfc/rfc9110) and
[RFC&nbsp;7231](https://www.rfc-editor.org/rfc/rfc7231). For example:

```txt
GET /api/v1/posts?sort=["title","ASC"]&range=[0,4]&filter={"author_id":12}

HTTP/1.1 200 OK
Content-Type: application/json
Content-Range: posts 0-4/27
[
  { "id": 126, "title": "allo?", "author_id": 12 },
  { "id": 127, "title": "bien le bonjour", "author_id": 12 },
  { "id": 124, "title": "good day sunshine", "author_id": 12 },
  { "id": 123, "title": "hello, world", "author_id": 12 },
  { "id": 125, "title": "howdy partner", "author_id": 12 }
]
```

`POST` requests that create a resource return **201 Created** with the new record
in the body, while successful deletions respond with **204 No Content**. Example:

```txt
POST /api/v1/posts
{ "title": "hello, world", "author_id": 12 }

HTTP/1.1 201 Created
Content-Type: application/json
{ "id": 123, "title": "hello, world", "author_id": 12 }

DELETE /api/v1/posts/123

HTTP/1.1 204 No Content
```

## Environment Variables

The worker relies on several Cloudflare bindings declared in the root `wrangler.json` file. These bindings are automatically copied into the app configuration so every application in the monorepo shares the same environment variables:

- `DB` – D1 database connection used by the `@flarekit/database` package.
- `STORAGE` – R2 bucket for uploaded files.
- `CACHE` – KV namespace for caching responses.
- `QUEUE` – Queue binding for background jobs.

Example snippet from `wrangler.json`:

```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "flarekit-d1"
    }
  ],
  "r2_buckets": [
    {
      "binding": "STORAGE",
      "bucket_name": "flarekit-storage"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "CACHE",
      "id": "<kv-id>"
    }
  ],
  "queues": {
    "producers": [{ "binding": "QUEUE", "queue": "flarekit-queue" }]
  }
}
```

You can declare additional variables specific to this app using the `vars` field in `wrangler.config.json` or by editing `.dev.vars` during development.

## Development and Testing

Install dependencies and start the local worker from the repository root:

```bash
npm install
npm run dev -w @flarekit/backend
```

Running the commands from the repository root automatically invokes the **Flarekit CLI** (`npx flarekit`). This script merges the shared `wrangler.json` and copies `.dev.vars` into each workspace so local development mirrors production settings. If you prefer to start the worker directly, run `npm run setup` once to generate these files.

Run the unit tests for the backend:

```bash
npm run test -w @flarekit/backend
```

### Generating OpenAPI Documentation

1. Start the development server as shown above.
2. Visit `http://localhost:8000/specification.json` to download the OpenAPI schema or `http://localhost:8000/docs` for the Swagger UI.
3. You can save the specification locally with:
   ```bash
   curl http://localhost:8000/specification.json > openapi.json
   ```

### Deployment

Deployments are handled automatically through the repository's GitHub Actions workflows. Manual deployment is rarely required, but you can refer to the root `README.md` for instructions if needed.

## Features

- 🚀 **Hono Framework** - Fast, lightweight web framework optimized for edge computing
- 📊 **Database Integration** - SQLite with Drizzle ORM and automated migrations
- 🔧 **Auto-generated Schemas** - Zod schemas with OpenAPI documentation
- 🛡️ **Comprehensive Error Handling** - Structured error responses with detailed context
- 📁 **File Storage** - R2 integration for file uploads and management
- 🔍 **Smart Route Analysis** - Automatic detection of route patterns and parameter handling
- ⚡ **Edge Optimized** - Built for Cloudflare Workers with minimal cold start time

## Route Parameter Patterns

The backend uses intelligent route analysis to automatically handle different endpoint patterns:

### Path Parameters

For single resource retrieval, use the `:id` parameter pattern:

```typescript
// Route definition
path: '/api/v1/storage/{id}'; // OpenAPI spec format

// In route handler
const id = c.req.param('id');
```

### Schema Usage

- **Standard ID Parameters**: Use `GetOneParamSchema` for `:id` path parameters
- **Custom Parameters**: Create custom parameter schemas for non-standard paths

```typescript
import { GetOneParamSchema } from '@/schemas/getOneQuery.schema';

export const storageGetOneEndpoint = createApiEndpoint({
  resource: 'Storage',
  method: 'get',
  path: '/api/v1/storage/{id}',
  request: {
    params: GetOneParamSchema, // Validates :id parameter
  },
  handler: async (c) => {
    const id = c.req.param('id');
    // Implementation
  },
});
```

### Route Analysis

The route analyzer automatically detects endpoint types:

- **List Routes**: `GET /resource` (no path variables)
- **Get By ID Routes**: `GET /resource/:id` (specifically `:id` parameter)
- **Create Routes**: `POST /resource` (no path variables)
- **Update Routes**: `PUT/PATCH /resource/:id` (with path variables)
- **Delete Routes**: `DELETE /resource/:id` (with path variables)

### Custom Parameter Schemas

For non-standard path parameters, create custom schemas:

```typescript
const SlugParamSchema = z
  .object({
    slug: z.string().openapi({
      param: {
        name: 'slug',
        in: 'path',
        description: 'Resource slug identifier',
        required: true,
        schema: { type: 'string' },
      },
    }),
  })
  .openapi('SlugParamSchema');
```

## API Documentation
