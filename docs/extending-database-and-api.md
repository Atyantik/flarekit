# Extending the Database and Backend API

This guide explains how the `packages/database` package and the `apps/backend` worker integrate, and how to add a new table with accompanying API routes.

## How Backend and Database Work Together

- `packages/database` exports typed services for each table using [Drizzle ORM](https://github.com/drizzle-team/drizzle-orm).
- `apps/backend` calls `initDBInstance(c, c.env)` from this package to get access to those services inside route handlers.
- The database package provides a `BaseService` class with helpers like `create`, `update`, `getList` and others. Each table service extends this base class.

## Adding a New Schema

1. **Create the schema file**
   - Place a file in `packages/database/src/schema`. Example:
     ```ts
     // packages/database/src/schema/user.schema.ts
     import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
     import { sql } from 'drizzle-orm';

     export const userSchema = sqliteTable('users', {
       id: text('id').primaryKey(),
       name: text('name').notNull(),
       email: text('email').notNull(),
       createdAt: text('created_at').default(sql`(current_timestamp)`),
     });
     ```

2. **Register the schema**
   - Edit `packages/database/src/schemas.ts` and add the schema to the exported `schemas` map:
     ```ts
     import { userSchema } from '@schema/user.schema';
     export const schemas = {
       [getTableName(storageSchema)]: storageSchema,
       [getTableName(userSchema)]: userSchema,
     };
     ```

3. **Expose a service**
   - Update `packages/database/src/services.ts` to create a service instance:
     ```ts
     import { userSchema } from './schema/user.schema';

     export const services = (ctx: Ctx) => ({
       [getTableName(storageSchema)]: new BaseService<typeof storageSchema.$inferInsert, typeof storageSchema.$inferSelect>(storageSchema, ctx),
       [getTableName(userSchema)]: new BaseService<typeof userSchema.$inferInsert, typeof userSchema.$inferSelect>(userSchema, ctx),
     });
     ```

4. **Extend types**
   - Update `packages/database/src/types.ts` so the `Ctx` type knows about the new table:
     ```ts
     import { userSchema } from '@schema/user.schema';

     export interface Ctx {
       db: DrizzleD1Database<{
         [storageSchema._.name]: typeof storageSchema;
         [userSchema._.name]: typeof userSchema;
       }>;
     }
     ```

5. **Generate and apply migrations**
   ```bash
   npx flarekit build:migrations
   npx flarekit migrate:d1:local # or migrate:d1:production
   ```

## Creating API Routes

Routes live inside `apps/backend/src/routes/v1`. Each route file is written with
`hono/zod-openapi` so that request and response schemas become part of the
generated OpenAPI document.

### 1. Create the route file

```ts
// apps/backend/src/routes/v1/user.route.ts
import { z } from 'zod';
import { createRoute } from 'hono/zod-openapi';
import { initDBInstance } from '@flarekit/database';

const userInput = z.object({
  name: z.string(),
  email: z.string().email(),
});

const userResponse = userInput.extend({ id: z.string() });

export const createUser = createRoute({
  method: 'post',
  path: '/v1/users',
  request: {
    body: {
      content: {
        'application/json': { schema: userInput },
      },
    },
  },
  responses: {
    200: {
      description: 'Created user',
      content: {
        'application/json': { schema: userResponse },
      },
    },
  },
  handler: async (c) => {
    const db = initDBInstance(c, c.env);
    const body = await c.req.json();
    const record = await db.users.create(body);
    return c.json(record);
  },
});
```

### 2. Register the route

Create `apps/backend/src/routes/v1/index.ts` if it does not exist and export the
route instances:

```ts
// apps/backend/src/routes/v1/index.ts
export { createUser } from './user.route';
```

### 3. Mount the routes

Import the routes in `apps/backend/src/index.ts` and add them to the Hono app:

```ts
import * as v1 from './routes/v1';

const app = new Hono<{ Bindings: Env }>();
app.use(cors());

app.route('/v1', (r) => {
  r.post('/users', v1.createUser);
});
```

Repeat this pattern for other CRUD operations using `BaseService` helper methods
like `getList`, `getById`, `update`, and `delete`.
