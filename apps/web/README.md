# **Astroflare Web App**

This repository contains the **Astroflare Web App**, a high-performance, edge-first web application built with **Astro** and deployed on **Cloudflare Pages**. It includes serverless API routes, R2 integration, and D1 database management, making it an ideal choice for scalable web applications.

---

## **Table of Contents**

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [About Atyantik Technologies](#about-atyantik-technologies)

---

## **Overview**

The Astroflare Web App is part of the Astroflare ecosystem. This project leverages:

- **Astro**: For creating fast, SEO-friendly frontends.
- **Cloudflare Pages**: For edge-first deployment and serverless APIs.
- **D1**: Cloudflare’s database for lightweight and scalable storage.
- **R2**: Cloudflare’s object storage for large files.

---

## **Features**

- ⚡ **Astro-Powered**: Build island-architecture web apps.
- 🌐 **Cloudflare Pages**: Global deployment with edge performance.
- 🛠️ **D1 Database Management**: Easy migrations for local and production environments.
- 📦 **R2 Integration**: Secure file storage for scalable solutions.
- 🔐 **Utils and Middleware**: Reusable utilities for hashing, Base64 encoding, and middleware logic.

---

## **Getting Started**

### **1. Clone the Repository**

```bash
git clone https://github.com/Atyantik/astroflare.git
cd apps/web
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Run the Development Server**

Start the local development server with Cloudflare workers and types:

```bash
npm run dev
```

### **4. Build for Production**

Build the application and apply D1 migrations:

```bash
npm run build:production
```

### **5. Preview the Build**

Preview the production build locally:

```bash
npm run preview
```

---

## **Scripts**

The following npm scripts are available in the `package.json`:

| Command                      | Description                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| `npm run dev`                | Starts the development server with Cloudflare worker types.                                |
| `npm run build:local`        | Builds the application for local development and applies D1 migrations locally.            |
| `npm run build:production`   | Builds the application for production and applies D1 migrations to the remote environment. |
| `npm run migrate:local`      | Applies D1 migrations to the local database.                                               |
| `npm run migrate:production` | Applies D1 migrations to the remote production database.                                   |
| `npm run preview`            | Previews the production build locally.                                                     |
| `npm run astro`              | Runs Astro CLI commands.                                                                   |

---

## **Folder Structure**

```
src/
├── components/         # UI Components
├── layouts/            # Layout templates
├── pages/              # Pages for the app
│   ├── api/            # API routes (serverless)
│   ├── cdn/            # CDN logic for files
│   └── index.astro     # Main landing page
├── utils/              # Utility functions
│   ├── base64.util.ts  # Base64 encoding/decoding
│   ├── hash.util.ts    # Hashing utilities
│   ├── r2-storage.util.ts # R2 integration
│   ├── env.d.ts        # Environment variables
│   └── middleware.ts   # Middleware logic
```

---

## **Contributing**

We welcome contributions to improve Astroflare. Please follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit:
   ```bash
   git commit -m "Add your feature"
   ```
4. Push the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Submit a pull request.

---

## **About Atyantik Technologies**

Astroflare is proudly supported and sponsored by **[Atyantik Technologies](https://atyantik.com)**, a leading software development company specializing in scalable web applications, cloud services, and cutting-edge technologies.

<p align="center">
  <img src="https://cdn.atyantik.com/atyantik-logo.png" alt="Atyantik Technologies" width="200">
</p>

### **Contact Atyantik**

- 🌐 [Website](https://atyantik.com)
- 💼 [LinkedIn](https://www.linkedin.com/company/atyantik-technologies/)
- 🐦 [Twitter](https://twitter.com/atyantik_tech)

Astroflare Web App – Simplifying Edge-First Development with Cloudflare 🌍✨
