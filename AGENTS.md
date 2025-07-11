# Agent Instructions

This repository is a monorepo containing Cloudflare Workers, a web app, and a shared database package. Development tasks are coordinated via **npm** and **TurboRepo**. See the [README](README.md) for a complete project overview.

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start all apps and services for local development:
   ```bash
   npm run dev
   ```
   You can start a single workspace with Turbo filters, e.g.:
   ```bash
   npx flarekit dev --filter="@flarekit/backend"
   ```

## Testing

- Run unit tests for all workspaces:
  ```bash
  npm test
  ```
- Run end‑to‑end tests (requires Playwright):
  ```bash
  npx playwright install && npm run test:e2e
  ```
- Backend tests can also be run directly:
  ```bash
  npm run test -w @flarekit/backend
  ```

## Database migrations

Generate migration files then apply them locally:

```bash
npx flarekit build:migrations
npx flarekit migrate:d1:local
```

Production migrations use `migrate:d1:production`.

## Linting and formatting

- Lint code with ESLint:
  ```bash
  npm run lint
  ```
- Format with Prettier:
  ```bash
  npm run format
  ```

Pre‑commit hooks run `lint-staged`; pre‑push hooks run the test suites. These hooks are installed via Husky.

## Environment configuration

Shared variables live in `.dev.vars`. Each workspace receives a copy when running `npm run setup` (or implicitly via `npm run dev`). You can add additional variables per workspace as described in `apps/backend/README.md`.

## Route Parameter Development Patterns

When working with API routes that require path parameters:

### Standard ID Parameters

- Use `:id` for single resource identification in route paths
- Import `GetOneParamSchema` from `@/schemas/getOneQuery.schema` for validation
- OpenAPI spec uses curly braces: `/api/v1/storage/{id}`
- Access parameters with: `const id = c.req.param('id')`

### Route Analysis

The route analyzer automatically detects:

- **Get By ID Routes**: Only routes with specifically `:id` parameter (not other parameter names)
- **List Routes**: GET routes without path variables
- **Create Routes**: POST routes without path variables
- **Update/Delete Routes**: PUT/PATCH/DELETE routes with path variables

### Error Handling for Missing Resources

- Use `NotFoundError` for missing resources, not `DatabaseError`
- Include context information in error constructors
- Example: `throw new NotFoundError('Storage', id);`

### Custom Parameters

For non-standard path parameters (not `:id`), create custom parameter schemas:

```typescript
const CustomParamSchema = z
  .object({
    paramName: z.string().openapi({
      param: {
        name: 'paramName',
        in: 'path',
        description: 'Description of the parameter',
        required: true,
        schema: { type: 'string' },
      },
    }),
  })
  .openapi('CustomParamSchema');
```

## Documentation and style guides

- **Backend error system**: see `apps/backend/docs/error-handling.md` for detailed patterns.
- Additional development conventions are defined in `.cursor/rules/`:
  - `monorepo-organization.mdc`
  - `cloudflare-worker-patterns.mdc`
  - `database-service-patterns.mdc`
  - `error-handling-patterns.mdc`
  - `hono-api-patterns.mdc`
  - `error-handling.mdc`

Follow these guidelines when editing the respective areas.

## Requirements

- Node.js version `>=22.16.0` is specified in `package.json`.
- The README lists Node 18+ and npm as prerequisites.
