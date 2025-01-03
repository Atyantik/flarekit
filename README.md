<p align="center">
  <img src="https://cdn.atyantik.com/Flarekit.webp" alt="Flarekit" width="200" style="border-radius: 20px;">
</p>

# Flarekit

![License](https://img.shields.io/github/license/Atyantik/flarekit)

Flarekit is a **scalable and modular monorepo** designed to build modern, **edge-first** web applications using **[Astro](https://astro.build/)** and **[Cloudflare Workers](https://workers.cloudflare.com/)**. It streamlines the development process by providing a unified structure for frontend, backend, and shared services, ensuring **code reusability**, **maintainability**, and **performance** across globally distributed applications.

Supported and sponsored by **[Atyantik Technologies](https://atyantik.com)**. 🚀

---

## Table of Contents

- [Key Features](#key-features)
- [Available Packages & Apps](#available-packages--apps)
  - [Applications](#applications)
  - [Packages](#packages)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Local Development](#local-development)
- [Testing & Coverage](#testing--coverage)
- [Deployment](#deployment)
- [Database & Migrations](#database--migrations)
- [Scripts Overview](#scripts-overview)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)
- [About Atyantik Technologies](#about-atyantik-technologies)

---

## Key Features

- **Monorepo Architecture with [Turborepo](https://turbo.build/)**  
  Efficiently manage multiple applications and packages within a single repository, ensuring consistent tooling and streamlined workflows.

- **Edge-Optimized Backend**  
  Leverage **[Cloudflare Workers](https://workers.cloudflare.com/)** to deploy backend services globally, ensuring low-latency responses and high availability.

- **Astro-Powered Frontend**  
  Build highly performant and SEO-friendly websites using **[Astro’s island architecture](https://docs.astro.build/en/core-concepts/islands/)**, minimizing client-side JavaScript and enhancing load times.

- **Centralized Database Management**  
  Utilize the `@flarekit/database` package for managing schemas, migrations, and database interactions with **[Cloudflare D1](https://developers.cloudflare.com/d1/)**.

- **TypeScript Excellence**  
  Embrace **TypeScript-first** development for type safety, improved developer experience, and robust codebases.

- **Comprehensive Testing & Coverage**  
  Integrated with **[Vitest](https://vitest.dev/)** and Istanbul to ensure your code is reliable and well-tested across the entire monorepo.

- **Advanced Cloudflare Integrations**

  - **[KV Namespaces](https://developers.cloudflare.com/workers/runtime-apis/kv/)**: Utilize Cloudflare KV for caching to enhance performance.
  - **[R2 Buckets](https://developers.cloudflare.com/r2/)**: Seamlessly integrate with Cloudflare R2 for scalable object storage.
  - **[Queues](https://developers.cloudflare.com/workers/learning/queues/)**: Implement robust queueing systems for background tasks and event-driven workflows.

- **Extensible and Modular**  
  Easily add new applications or services without disrupting existing workflows, thanks to Flarekit’s modular design.

---

## Available Packages & Apps

### Applications

- **`@flarekit/web`**  
  The **Astro-based frontend** application.

  - **Features:**
    - Utilizes Astro’s island architecture for optimized performance.
    - Deployed to **[Cloudflare Pages](https://pages.cloudflare.com/)** or other hosting services.
    - Includes built-in utilities for handling uploads, CDN interactions, and more.

- **`@flarekit/backend`**  
  The **Cloudflare Worker–based backend** service.
  - **Features:**
    - Implements API endpoints and backend logic using **Cloudflare Workers**.
    - Seamlessly integrates with the `@flarekit/database` package for data persistence.
    - Supports advanced Cloudflare features like KV caching, R2 storage, and queue management.

### Packages

- **`@flarekit/database`**  
  Centralized **database management** package.
  - **Features:**
    - Manages **[Drizzle](https://drizzle.team/)** configurations, schemas, and migrations.
    - Supports **[Cloudflare D1](https://developers.cloudflare.com/d1/)** for data storage.
    - Provides utility functions and services for database interactions.

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **[Node.js v18+](https://nodejs.org/)**
- **npm v7+** (or another modern package manager)
- **[Wrangler CLI](https://developers.cloudflare.com/workers/tooling/wrangler/)** (Cloudflare’s developer tool)
  ```bash
  npm install -g wrangler
  ```

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Atyantik/flarekit.git
   cd flarekit
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

### Local Development

Start developing with a single command that handles setup and launches all necessary services:

```bash
npm run dev
```

**What It Does:**

- Automatically handles the **setup** tasks required by Turborepo.
- Starts the **Astro frontend** (`@flarekit/web`) and **Cloudflare Worker backend** (`@flarekit/backend`) in development mode.
- Watches for file changes and reloads services as needed.

---

## Testing & Coverage

Ensure your code is robust and reliable with integrated testing tools:

- **Run All Tests**

  ```bash
  npm run test
  ```

- **Generate Test Coverage Report**
  ```bash
  npm run test:coverage
  ```

---

## Deployment

Deploy your applications with ease:

- **Deploy Web Application**

  ```bash
  npm run deploy:web
  ```

  - **What It Does:**
    - Builds the `@flarekit/web` Astro application.
    - Deploys the built frontend to **[Cloudflare Pages](https://pages.cloudflare.com/)** or your configured hosting provider.

- **Deploy Backend Services**  
  _Currently, backend deployment is managed manually via Wrangler commands within the `@flarekit/backend` directory. Future updates may include automated deployment scripts._

---

## Database & Migrations

Manage your database schemas and migrations effortlessly:

- **Apply Migrations Locally**

  ```bash
  npm run migrate:d1:local
  ```

- **Apply Migrations to Production**
  ```bash
  npm run migrate:d1:production
  ```

> **Note:**  
> The migration scripts utilize `scripts/parse-d1.js` to automatically configure and apply migrations based on your environment settings.

---

## Scripts Overview

A summary of the key scripts available in the root `package.json`:

| Script                  | Description                                                           |
| ----------------------- | --------------------------------------------------------------------- |
| `setup`                 | Initializes Turborepo and prepares the environment.                   |
| `dev`                   | Runs the development servers for all applications and services.       |
| `deploy:web`            | Builds and deploys the Astro-based frontend application.              |
| `migrate:d1:local`      | Applies database migrations to the local Cloudflare D1 instance.      |
| `migrate:d1:production` | Applies database migrations to the production Cloudflare D1 instance. |
| `test`                  | Builds necessary packages and runs the test suites in CI mode.        |
| `test:coverage`         | Executes tests with coverage reporting enabled.                       |
| `lint`                  | Analyzes code for linting errors using ESLint.                        |
| `format`                | Formats the codebase according to Prettier configurations.            |

---

## Configuration

Flarekit leverages several configuration files to manage different aspects of the monorepo:

- **[Turborepo](https://turbo.build/)** (`turbo.json`)  
  Orchestrates build, development, and deployment tasks across the monorepo.

- **TypeScript** (`tsconfig.json`)  
  Shared and project-specific TypeScript configurations ensure type safety and consistent development practices.

- **ESLint & Prettier**  
  Maintains code quality and consistency across all projects with shared ESLint and Prettier configurations.

- **[Wrangler](https://developers.cloudflare.com/workers/tooling/wrangler/)** (`wrangler.config.json` & `wrangler.json`)  
  Configures Cloudflare Worker deployments for backend services, including:

  - **KV Namespaces (Cache):** Enhances performance with [Cloudflare KV](https://developers.cloudflare.com/workers/runtime-apis/kv/) caching.
  - **R2 Buckets (Storage):** Provides scalable object storage solutions with [Cloudflare R2](https://developers.cloudflare.com/r2/).
  - **Queues:** Manages background tasks and event-driven workflows using [Cloudflare Queues](https://developers.cloudflare.com/workers/runtime-apis/queues/).

- **Environment Variables**  
  Manage sensitive data and environment-specific settings using `.env` files or Cloudflare’s environment variables.

---

## Contributing

We welcome contributions to enhance Flarekit! Whether you’re fixing bugs, adding new features, or improving documentation, your efforts are appreciated.

### How to Contribute

1. **Fork the Repository**  
   Click the "Fork" button at the top-right corner of the repository page.

2. **Create a New Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m "Add your feature"
   ```

4. **Push to Your Fork**

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**  
   Navigate to the original repository and open a pull request against the `main` branch.

> **Note:**  
> Please ensure your code adheres to the existing style guidelines and passes all tests before submitting a pull request.

---

## License

Flarekit is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute this software as per the license terms.

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
