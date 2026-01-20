# nextjs-drizzle-gen

[![CI](https://github.com/mantaskaveckas/nextjs-drizzle-gen/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/mantaskaveckas/nextjs-drizzle-gen/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/nextjs-drizzle-gen)](https://www.npmjs.com/package/nextjs-drizzle-gen)
[![npm downloads](https://img.shields.io/npm/dm/nextjs-drizzle-gen)](https://www.npmjs.com/package/nextjs-drizzle-gen)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Rails-like generators for Next.js + Drizzle ORM projects. Generate models, server actions, CRUD pages, and API routes with a single command.

[**Documentation**](https://mantaskaveckas.github.io/nextjs-drizzle-gen/)

## Installation

```bash
npm install -g nextjs-drizzle-gen
```

Or use with npx:

```bash
npx nextjs-drizzle-gen scaffold post title:string body:text
```

## Quick Start

```bash
# Generate a full CRUD scaffold (model + actions + pages)
drizzle-gen scaffold post title:string body:text published:boolean

# Generate just model and actions (no views)
drizzle-gen resource user name:string email:string:unique

# Generate model and REST API routes
drizzle-gen api product name:string price:float

# Generate only a model
drizzle-gen model comment content:text authorId:references:user

# Generate only actions for an existing model
drizzle-gen actions post
```

## Commands

### `drizzle-gen model <name> [fields...]`

Creates a Drizzle schema model in `db/schema.ts`.

```bash
drizzle-gen model user name:string email:string:unique
drizzle-gen model post title:string body:text published:boolean
drizzle-gen model order total:decimal status:enum:pending,paid,shipped
```

### `drizzle-gen actions <name>`

Creates server actions file with CRUD operations.

```bash
drizzle-gen actions user
```

### `drizzle-gen resource <name> [fields...]`

Creates model + actions (no UI pages).

```bash
drizzle-gen resource session token:uuid userId:references:user --uuid
```

### `drizzle-gen scaffold <name> [fields...]`

Creates model + actions + full CRUD pages (list, show, new, edit).

```bash
drizzle-gen scaffold product name:string price:float description:text?
```

### `drizzle-gen api <name> [fields...]`

Creates model + REST API route handlers.

```bash
drizzle-gen api webhook url:string secret:string:unique
```

### `drizzle-gen destroy <type> <name>`

Removes drizzle-gend files (does not modify schema).

```bash
drizzle-gen destroy scaffold post
drizzle-gen destroy api product --dry-run
```

### `drizzle-gen config`

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
  drizzle-gen model user bio:text? nickname?
  ```

- **Unique**: Add `:unique` modifier
  ```bash
  drizzle-gen model user email:string:unique
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

Run `drizzle-gen config` to see detected settings.

## Example Output

```bash
$ drizzle-gen scaffold post title:string body:text published:boolean

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
- Drizzle ORM configured

## License

MIT
