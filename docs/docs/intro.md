---
id: intro
title: Getting Started
sidebar_position: 1
slug: /
---

<div style={{textAlign: 'center'}}>
  <img src="/brizzle/img/logo.png" alt="brizzle logo" width="120" />
</div>

<h1 align="center">brizzle</h1>

Rails-like generators for Next.js + Drizzle ORM projects. Generate models, server actions, CRUD pages, and API routes with a single command.

## Quick Start

```bash
# Generate a full CRUD scaffold (model + actions + pages)
brizzle scaffold post title:string body:text published:boolean

# Generate just model and actions (no views)
brizzle resource user name:string email:string:unique

# Generate model and REST API routes
brizzle api product name:string price:float

# Generate only a model
brizzle model comment content:text authorId:references:user

# Generate only actions for an existing model
brizzle actions post
```

## What Gets Generated

When you run `brizzle scaffold post title:string body:text published:boolean`, you get:

```
db/schema.ts          # Drizzle model definition
app/posts/
├── actions.ts        # Server actions (CRUD operations)
├── page.tsx          # List page
├── new/page.tsx      # Create form
├── [id]/page.tsx     # Detail view
└── [id]/edit/page.tsx # Edit form
```

## Requirements

- Node.js >= 18
- Next.js project with App Router
- Drizzle ORM configured

## Auto-Detection

The generator automatically detects your project configuration:

- **Project structure**: `src/app/` vs `app/`
- **Path aliases**: Reads from `tsconfig.json` (`@/`, `~/`, etc.)
- **Database dialect**: Reads from `drizzle.config.ts` (SQLite, PostgreSQL, MySQL)
- **DB location**: Checks `db/`, `lib/db/`, `server/db/`

Run `brizzle config` to see detected settings.
