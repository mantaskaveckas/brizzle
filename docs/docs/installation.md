---
id: installation
title: Installation
sidebar_position: 2
---

# Installation

## Global Installation

Install globally to use the `brizzle` command anywhere:

```bash
npm install -g brizzle
```

Then use it in any Next.js + Drizzle project:

```bash
brizzle scaffold post title:string body:text
```

## Using npx

Run without installing:

```bash
npx brizzle scaffold post title:string body:text
```

## Quick Setup with brizzle init

The easiest way to set up Drizzle ORM is using the init command:

```bash
npx brizzle init
```

This interactive wizard will:
- Ask you to choose a database dialect (SQLite, PostgreSQL, MySQL)
- Let you select a database driver
- Generate all necessary configuration files
- Install required dependencies
- Add helper scripts to package.json

See [brizzle init](/generators/init) for full documentation.

## Manual Setup

If you prefer to set up Drizzle ORM manually, ensure your project has:

### 1. Next.js with App Router

Your project should use the Next.js App Router (Next.js 13.4+).

### 2. Drizzle ORM

Install and configure Drizzle ORM:

```bash
npm install drizzle-orm
npm install -D drizzle-kit
```

### 3. drizzle.config.ts

Create a `drizzle.config.ts` file in your project root. The generator reads this file to detect your database dialect.

**SQLite example:**
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./dev.db",
  },
});
```

**PostgreSQL example:**
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### 4. Database Instance

Create a database instance file. The generator expects it at `db/index.ts` (or `src/db/index.ts` if using src directory):

```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const sqlite = new Database("./dev.db");
export const db = drizzle(sqlite);
```

## Verifying Setup

Run the config command to verify your setup:

```bash
brizzle config
```

This will show your detected configuration:

```
Project Configuration:
  Structure: app/
  Path alias: @
  DB path: db
  Dialect: sqlite
```
