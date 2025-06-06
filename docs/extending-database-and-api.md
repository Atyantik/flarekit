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

Create a new route file under `apps/backend/src/routes` that uses the service methods. Example for a `user` API:

```ts
// apps/backend/src/routes/user.route.ts
import { initDBInstance } from '@flarekit/database';
import { Handler } from 'hono';

export const createUser: Handler = async (c) => {
  const db = initDBInstance(c, c.env);
  const body = await c.req.json();
  const record = await db.users.create(body);
  return c.json(record);
};
```

Register the route in `apps/backend/src/index.ts`:
```ts
import { createUser } from './routes/user.route';

app.post('/users', createUser);
```

This pattern can be repeated for other CRUD operations using `BaseService` methods such as `getList`, `getById`, `update` and `delete`.
