<p align="center">
  <img src="https://cdn.atyantik.com/flarekit-logo-480p.webp" alt="Flarekit" width="200">
</p>

# Flarekit

![License](https://img.shields.io/github/license/Atyantik/flarekit)

Flarekit is a **scalable and modular monorepo** designed to build modern, **edge-first** web applications using **[Cloudflare Infrastructure](https://developers.cloudflare.com/)**. It provides a unified structure for developing frontend, backend, and shared services, ensuring **code reusability**, **maintainability**, and **performance** across distributed applications.

Supported and sponsored by **[Atyantik Technologies](https://atyantik.com)**. 🚀

---

## Table of Contents

1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Setup Instructions](#setup-instructions)
5. [Development](#development)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Manual Deployment](#manual-deployment)
9. [Working with Database Services](#working-with-database-services)
10. [Contribution Guidelines](#contribution-guidelines)
11. [License](#license)

---

## Introduction

Flarekit simplifies the complexities of building interconnected apps for **[Cloudflare Infrastructure](https://developers.cloudflare.com/)**. While Cloudflare provides excellent production-ready tools, local development and testing often pose challenges. Flarekit addresses this by providing:

- Predefined commands for managing apps and databases.
- Integrated developer tools like **[ESLint](https://eslint.org/)**, **[Prettier](https://prettier.io/)**, and examples using **[Astro](https://astro.build/)** (frontend) and **[Hono](https://hono.dev/)** (backend).
- Shared infrastructure setup supporting **[D1 databases](https://developers.cloudflare.com/d1/)**, **[R2 storage](https://developers.cloudflare.com/r2/)**, and **[Queues](https://developers.cloudflare.com/queues/)** for seamless local and production environments.

By enabling an edge-first development model, Flarekit ensures developers can create scalable, maintainable, and testable applications for Cloudflare.

---

## Project Structure

The monorepo is organized as follows:

```
flarekit/
├── apps/
│   ├── backend/   # Backend services
│   └── web/       # Frontend application
├── packages/
│   └── database/  # Shared database layer
├── scripts/       # Utility scripts
├── .github/       # GitHub Actions workflows
├── turbo.json     # TurboRepo configuration
└── package.json   # Root package manager configuration
```

- **apps/backend**: Cloudflare Worker API built with **[Hono](https://hono.dev/)**.
- **apps/web**: Frontend application using **[Astro](https://astro.build/)**.
- **packages/database**: Centralized database layer with **[D1](https://developers.cloudflare.com/d1/)** and **[Drizzle ORM](https://github.com/drizzle-team/drizzle-orm)**.

---

## Prerequisites

Ensure the following tools are installed:

- **[Node.js](https://nodejs.org/)**: v18 or higher
- **[npm](https://www.npmjs.com/)**: Latest version

---

## Setup Instructions

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Atyantik/flarekit.git
   cd flarekit
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Start the Development Environment**:

   ```bash
   npm run dev
   ```

   **[TurboRepo](https://turbo.build/)** ensures all apps and services start seamlessly.

---

## Development

### Backend Development

```bash
npx flarekit dev --filter="@flarekit/backend"
```

### Frontend Development

```bash
npx flarekit dev --filter="@flarekit/web"
```

---

## Testing

### Run Unit Tests

```bash
npm test
```

### Run End-to-End Tests (Playwright)

```bash
npx playwright install && npm run test:e2e
```

---

## Deployment

### Automated Deployment (GitHub Actions)

Flarekit leverages **[GitHub Actions](https://docs.github.com/en/actions)** for automated deployments:

1. Linting and testing ensure code quality.
2. Builds separate deployable applications for backend and frontend.
3. Deploys to Cloudflare environments using **[Wrangler](https://developers.cloudflare.com/workers/cli-wrangler/)**.

### Manual Deployment

In cases where manual deployment is necessary:

1. Run linting:

   ```bash
   npm run lint
   ```

2. Build applications:

   ```bash
   npm run build
   ```

3. Run tests:

   ```bash
   npm test
   ```

4. Deploy database migrations:

   ```bash
   CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=<account_id> npx flarekit migrate:d1:production
   ```

5. Deploy frontend:

   ```bash
   cd apps/web
   CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=<account_id> npx wrangler pages deploy ./dist
   cd ../..
   ```

6. Deploy backend:

   ```bash
   cd apps/backend
   CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=<account_id> npx wrangler deploy
   cd ../..
   ```

---

## Working with Database Services

The database package (`@flarekit/database`) is a lightweight library built with **[Rollup](https://rollupjs.org/)**, ensuring compatibility with all monorepo apps.

### Why Drizzle ORM?

**[Drizzle ORM](https://github.com/drizzle-team/drizzle-orm)** is edge-deployable, making it ideal for Cloudflare’s infrastructure. Avoid non-edge-compatible ORMs.

### Creating a Schema

Define a schema in `packages/database/src/schema`:

```typescript
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const userSchema = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  createdAt: text('created_at').default(sql`(current_timestamp)`),
});
```

### Generating Migrations

Generate migrations:

```bash
npx flarekit build:migrations
```

### Applying Local Migrations

Run migrations locally:

```bash
npx flarekit migrate:d1:local
```

### Joining Tables

The `BaseService` constructor accepts an optional `relations` array to join
related tables using Drizzle ORM.

```typescript
import { eq } from 'drizzle-orm';
import { storageSchema, storageInfoSchema } from '@flarekit/database';

const storageInfoService = new BaseService(storageInfoSchema, ctx, [
  {
    schema: storageSchema,
    on: (info, storage) => eq(info.storageId, storage.id),
  },
]);

// Fetch a record with its related storage entry
const result = await storageInfoService.getByIdWithRelations(id);
```

---

## Contribution Guidelines

1. **Fork the Repository**:
   Fork the Flarekit repository to your GitHub account and clone it locally:

   ```bash
   git clone https://github.com/<your-username>/flarekit.git
   cd flarekit
   ```

2. **Create a Feature Branch**:
   Create a branch for your feature or bug fix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Implement Changes**:

   - Write your code following the project's style and guidelines.
   - Pre-commit and pre-push hooks will automatically ensure linting and quality checks. You can also run them manually:
     ```bash
     npm run lint
     ```

4. **Write Tests**:
   Add unit and integration tests for your changes:

   ```bash
   npm test
   ```

5. **Push Your Changes**:
   Push your feature branch to your forked repository:

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Submit a Pull Request**:

   - Open a pull request from your branch to the main Flarekit repository.
   - Include a clear and detailed description of your changes, linking any relevant issues.
   - Provide steps for testing your contribution if necessary.

By following these steps, you contribute to the success and quality of the Flarekit project.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

For further assistance, refer to the **[Cloudflare Developers Documentation](https://developers.cloudflare.com/)** or contact the maintainers.

---

## About Atyantik Technologies

Flarekit is proudly supported and sponsored by **[Atyantik Technologies](https://atyantik.com)**, a leading software development company specializing in scalable web applications, cloud services, and cutting-edge technologies.

### Contact Atyantik

- 🌐 [Website](https://atyantik.com)
- 💼 [LinkedIn](https://linkedin.com/company/atyantik-technologies/)
- 🐦 [Twitter](https://twitter.com/atyantik_tech)

<p align="center">
  <img src="https://cdn.atyantik.com/atyantik-logo.png" alt="Atyantik Technologies" width="200">
</p>

---

**Flarekit** – Simplifying Edge-First Development with [Cloudflare](https://www.cloudflare.com/) and [Astro](https://astro.build/)! 🌍✨

For issues or inquiries, please [open an issue](https://github.com/Atyantik/flarekit/issues) or reach out directly. Thank you for contributing and using Flarekit!
