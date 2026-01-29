<p align="center">
  <img src="assets/logo.png" alt="brizzle logo" width="120" />
</p>

<h1 align="center">brizzle</h1>

<p align="center">
  <a href="https://github.com/mantaskaveckas/brizzle/actions/workflows/ci.yml"><img src="https://github.com/mantaskaveckas/brizzle/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI"></a>
  <a href="https://www.npmjs.com/package/brizzle"><img src="https://img.shields.io/npm/v/brizzle" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/brizzle"><img src="https://img.shields.io/npm/dm/brizzle" alt="npm downloads"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

Rails-like generators for Next.js + Drizzle ORM projects. Generate models, server actions, CRUD pages, and API routes with a single command.

[**Documentation**](https://mantaskaveckas.github.io/brizzle/)

## Installation

```bash
npm install -g brizzle
```

Or use with npx:

```bash
npx brizzle scaffold post title:string body:text
```

## Quick Start

```bash
# Initialize Drizzle ORM in your project
npx brizzle init

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

## Commands

### `brizzle init`

Interactive setup wizard for Drizzle ORM. Configures your database connection and generates all necessary files.

```bash
brizzle init
```

Supports:
- **SQLite**: better-sqlite3, libsql (Turso), bun:sqlite
- **PostgreSQL**: postgres.js, pg, neon, vercel-postgres
- **MySQL**: mysql2, planetscale

Options:
- `--dialect <dialect>` - Database dialect for non-interactive mode
- `--driver <driver>` - Database driver for non-interactive mode
- `--no-install` - Skip automatic dependency installation

### `brizzle model <name> [fields...]`

Creates a Drizzle schema model in `db/schema.ts`.

```bash
brizzle model user name:string email:string:unique
brizzle model post title:string body:text published:boolean
brizzle model order total:decimal status:enum:pending,paid,shipped
```

### `brizzle actions <name>`

Creates server actions file with CRUD operations.

```bash
brizzle actions user
```

### `brizzle resource <name> [fields...]`

Creates model + actions (no UI pages).

```bash
brizzle resource session token:uuid userId:references:user --uuid
```

### `brizzle scaffold <name> [fields...]`

Creates model + actions + full CRUD pages (list, show, new, edit).

```bash
brizzle scaffold product name:string price:float description:text?
```

### `brizzle api <name> [fields...]`

Creates model + REST API route handlers.

```bash
brizzle api webhook url:string secret:string:unique
```

### `brizzle destroy <type> <name>`

Removes generated files (does not modify schema).

```bash
brizzle destroy scaffold post
brizzle destroy api product --dry-run
```

### `brizzle config`

Shows detected project configuration.

## Field Types

| Type | SQLite | PostgreSQL | MySQL |
|------|--------|------------|-------|
| `string` | text | text | varchar(255) |
| `text` | text | text | text |
| `integer` / `int` | integer | integer | int |
| `bigint` | integer | bigint | bigint |
| `boolean` / `bool` | integer (mode: boolean) | boolean | boolean |
| `float` | real | doublePrecision | double |
| `decimal` | text | numeric | decimal |
| `datetime` / `timestamp` | integer (mode: timestamp) | timestamp | datetime |
| `date` | integer (mode: timestamp) | date | date |
| `json` | text | jsonb | json |
| `uuid` | text | uuid | varchar(36) |

### Special Types

- **`enum`**: `status:enum:draft,published,archived`
- **`references`**: `authorId:references:user`

## Field Modifiers

- **Nullable**: Add `?` to make field optional
  ```bash
  brizzle model user bio:text? nickname?
  ```

- **Unique**: Add `:unique` modifier
  ```bash
  brizzle model user email:string:unique
  ```

## Options

| Option | Description |
|--------|-------------|
| `-f, --force` | Overwrite existing files |
| `-n, --dry-run` | Preview changes without writing |
| `-u, --uuid` | Use UUID for primary key |
| `--no-timestamps` | Skip createdAt/updatedAt fields |

## Auto-Detection

The generator automatically detects your project configuration:

- **Project structure**: `src/app/` vs `app/`
- **Path aliases**: Reads from `tsconfig.json` (`@/`, `~/`, etc.)
- **Database dialect**: Reads from `drizzle.config.ts`
- **DB location**: Checks `db/`, `lib/db/`, `server/db/`

Run `brizzle config` to see detected settings.

## Example Output

```bash
$ brizzle scaffold post title:string body:text published:boolean

Scaffolding Post...

      create  db/schema.ts
      create  app/posts/actions.ts
      create  app/posts/page.tsx
      create  app/posts/new/page.tsx
      create  app/posts/[id]/page.tsx
      create  app/posts/[id]/edit/page.tsx

Next steps:
  1. Run 'pnpm db:push' to update the database
  2. Run 'pnpm dev' and visit /posts
```

## Requirements

- Node.js >= 18
- Next.js project with App Router
- Drizzle ORM configured (or run `brizzle init` to set it up)

## Roadmap

- [x] **Drizzle init** - `brizzle init` to set up Drizzle ORM, database config, and db connection
- [ ] **Authentication** - `brizzle auth` to generate [better-auth](https://www.better-auth.com/) setup with user model and sign-in/sign-up pages
- [ ] **Zod schemas** - Generate validation schemas for forms and API routes
- [ ] **Indexes** - Support for `name:string:index` field modifier
- [ ] **Default values** - Support for `status:string:default:active`
- [ ] **Soft deletes** - Add `--soft-delete` flag for `deletedAt` timestamp
- [ ] **Pagination** - Add pagination to list pages and API routes
- [ ] **Search & filtering** - Generate search/filter UI for list pages
- [ ] **Seed generator** - `brizzle seed <model>` to generate seed data files
- [ ] **Relations helper** - Better syntax for has-many/belongs-to relationships
- [ ] **Custom templates** - Allow overriding templates via `.brizzle/` directory
- [ ] **Interactive mode** - `brizzle new` wizard for step-by-step model creation
- [ ] **Import cleanup** - Remove unused imports when destroying models

Have a feature request? [Open an issue](https://github.com/mantaskaveckas/brizzle/issues)

## License

MIT
