---
id: cli-reference
title: CLI Reference
sidebar_position: 5
---

# CLI Reference

## Commands

### `brizzle init`

Interactive setup wizard for Drizzle ORM configuration.

```bash
brizzle init
```

**Options:**
- `--dialect <dialect>` - Database dialect (sqlite, postgresql, mysql) for non-interactive mode
- `--driver <driver>` - Database driver for non-interactive mode
- `--no-install` - Skip automatic dependency installation

**Example:**
```bash
# Interactive mode
brizzle init

# Non-interactive mode
brizzle init --dialect postgresql --driver postgres
```

---

### `brizzle model`

Creates a Drizzle schema model.

```bash
brizzle model <name> [fields...]
```

**Arguments:**
- `name` - Model name (singular, e.g., `user`, `post`)
- `fields` - Field definitions (see [Field Types](/field-types))

**Example:**
```bash
brizzle model user name:string email:string:unique
```

---

### `brizzle actions`

Creates server actions for an existing model.

```bash
brizzle actions <name>
```

**Arguments:**
- `name` - Model name (must exist in schema)

**Example:**
```bash
brizzle actions user
```

---

### `brizzle resource`

Creates model + actions (no UI pages).

```bash
brizzle resource <name> [fields...]
```

**Arguments:**
- `name` - Model name
- `fields` - Field definitions

**Example:**
```bash
brizzle resource session token:uuid userId:references:user
```

---

### `brizzle scaffold`

Creates model + actions + CRUD pages.

```bash
brizzle scaffold <name> [fields...]
```

**Arguments:**
- `name` - Model name
- `fields` - Field definitions

**Example:**
```bash
brizzle scaffold product name:string price:float description:text?
```

---

### `brizzle api`

Creates model + REST API routes.

```bash
brizzle api <name> [fields...]
```

**Arguments:**
- `name` - Model name
- `fields` - Field definitions

**Example:**
```bash
brizzle api webhook url:string secret:string:unique
```

---

### `brizzle destroy`

Removes generated files (does not modify schema).

```bash
brizzle destroy <type> <name>
```

**Arguments:**
- `type` - Generator type (`scaffold`, `api`, `actions`, `resource`)
- `name` - Model name

**Example:**
```bash
brizzle destroy scaffold post
brizzle destroy api product --dry-run
```

---

### `brizzle config`

Shows detected project configuration.

```bash
brizzle config
```

**Output:**
```
Project Configuration:
  Structure: app/
  Path alias: @
  DB path: db
  Dialect: sqlite
```

## Global Options

These options work with all generator commands:

| Option | Short | Description |
|--------|-------|-------------|
| `--force` | `-f` | Overwrite existing files |
| `--dry-run` | `-n` | Preview changes without writing |
| `--uuid` | `-u` | Use UUID for primary key |
| `--no-timestamps` | | Skip createdAt/updatedAt fields |
| `--help` | `-h` | Show help for command |

## Examples

### Dry Run

Preview what would be generated:

```bash
brizzle scaffold post title:string --dry-run
```

### Force Overwrite

Regenerate files even if they exist:

```bash
brizzle scaffold post title:string body:text --force
```

### UUID Primary Keys

Use UUIDs instead of auto-incrementing integers:

```bash
brizzle scaffold post title:string --uuid
```

### Skip Timestamps

Create model without createdAt/updatedAt:

```bash
brizzle model setting key:string value:text --no-timestamps
```
