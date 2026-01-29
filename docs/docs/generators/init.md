---
id: init
title: Init
sidebar_position: 0
---

# brizzle init

The `init` command sets up Drizzle ORM in your Next.js project with an interactive setup wizard.

## Usage

```bash
brizzle init
```

This launches an interactive wizard that guides you through:

1. **Select database dialect** - SQLite, PostgreSQL, or MySQL
2. **Select driver** - Choose from supported drivers for your dialect
3. **Configure paths** - Set database directory location
4. **Optional files** - Create .env.example and docker-compose.yml
5. **Install dependencies** - Automatically install required packages

## Generated Files

The init command creates:

| File | Description |
|------|-------------|
| `drizzle.config.ts` | Drizzle Kit configuration |
| `db/index.ts` | Database client with schema |
| `db/schema.ts` | Empty schema file for your models |
| `.env.example` | Environment variable template (optional) |
| `docker-compose.yml` | Local database setup (PostgreSQL/MySQL only) |

It also adds helper scripts to your `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

## Supported Drivers

### SQLite

| Driver | Package | Description |
|--------|---------|-------------|
| `better-sqlite3` | better-sqlite3 | Native SQLite for Node.js |
| `libsql` | @libsql/client | Turso edge database or local LibSQL |
| `bun:sqlite` | (built-in) | Bun's native SQLite driver |

### PostgreSQL

| Driver | Package | Description |
|--------|---------|-------------|
| `postgres` | postgres | postgres.js (recommended) |
| `pg` | pg | Traditional node-postgres driver |
| `neon` | @neondatabase/serverless | Neon serverless PostgreSQL |
| `vercel-postgres` | @vercel/postgres | Vercel's managed PostgreSQL |

### MySQL

| Driver | Package | Description |
|--------|---------|-------------|
| `mysql2` | mysql2 | Standard MySQL/MariaDB driver |
| `planetscale` | @planetscale/database | PlanetScale serverless MySQL |

## Options

| Option | Description |
|--------|-------------|
| `-f, --force` | Overwrite existing files without prompting |
| `-n, --dry-run` | Preview changes without writing files |
| `-d, --dialect <dialect>` | Database dialect (non-interactive mode) |
| `--driver <driver>` | Database driver (non-interactive mode) |
| `--no-install` | Skip automatic dependency installation |

## Non-Interactive Mode

For CI/CD or scripting, use `--dialect` and `--driver` to skip prompts:

```bash
# SQLite with better-sqlite3
brizzle init --dialect sqlite --driver better-sqlite3

# PostgreSQL with postgres.js
brizzle init --dialect postgresql --driver postgres

# MySQL with mysql2
brizzle init --dialect mysql --driver mysql2
```

## Examples

### Basic Setup (Interactive)

```bash
npx brizzle init
```

Follow the prompts to configure your database.

### PostgreSQL with Docker

```bash
brizzle init
# Select: PostgreSQL > postgres.js
# Answer "Yes" to docker-compose.yml
```

Then start your database:

```bash
docker compose up -d
cp .env.example .env
# Edit .env with your credentials
```

### Preview Changes

```bash
brizzle init --dry-run
```

Shows what files would be created without writing anything.

### Force Regenerate

```bash
brizzle init --force
```

Overwrites all existing configuration files.

## Next Steps

After running `brizzle init`:

1. Copy the environment file: `cp .env.example .env`
2. Set your database connection string in `.env`
3. Create your first model:
   ```bash
   npx brizzle model user name:string email:string:unique
   ```
4. Generate and run migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```
