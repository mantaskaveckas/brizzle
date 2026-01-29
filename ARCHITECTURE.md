# Brizzle Architecture

This document describes the internal architecture of Brizzle, a Rails-like code generator for Next.js + Drizzle ORM projects.

## Overview

Brizzle follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────┐
│              CLI Layer (index.ts)            │
│         Command parsing, error handling      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│           Generator Layer (generators/)      │
│  init, model, actions, scaffold, resource, api│
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│            Utility Layer (lib/)              │
│  config, drizzle, forms, strings, files, etc │
└─────────────────────────────────────────────┘
```

## Key Abstractions

### Field

Represents a parsed field definition:

```typescript
interface Field {
  name: string;          // Field name (camelCase)
  type: string;          // Field type (string, integer, etc.)
  isReference: boolean;  // Is this a foreign key reference?
  referenceTo?: string;  // Referenced model name
  isEnum: boolean;       // Is this an enum field?
  enumValues?: string[]; // Enum values if applicable
  nullable: boolean;     // Can be null?
  unique: boolean;       // Must be unique?
}
```

### ModelContext

Contains all naming variations for a model:

```typescript
interface ModelContext {
  name: string;           // Original input
  singularName: string;   // "post"
  pluralName: string;     // "posts"
  pascalName: string;     // "Post"
  pascalPlural: string;   // "Posts"
  camelName: string;      // "post"
  camelPlural: string;    // "posts"
  snakeName: string;      // "post"
  snakePlural: string;    // "posts"
  kebabName: string;      // "post"
  kebabPlural: string;    // "posts"
  tableName: string;      // "posts" (SQL table name)
}
```

### GeneratorOptions

Options passed to all generators:

```typescript
interface GeneratorOptions {
  force?: boolean;       // Overwrite existing files
  dryRun?: boolean;      // Preview without writing
  uuid?: boolean;        // Use UUID for primary key
  noTimestamps?: boolean; // Skip createdAt/updatedAt
}
```

### Dialect

Supported database dialects:

```typescript
type Dialect = "sqlite" | "postgresql" | "mysql";
```

## Data Flow

### Init Command

When a user runs `brizzle init`:

```
1. CLI Layer
   └─> Parse command arguments (Commander.js)
   └─> Call generateInit()

2. Generator Layer (init.ts)
   └─> runInitPrompts() - interactive @clack/prompts wizard
       └─> Select dialect (sqlite/postgresql/mysql)
       └─> Select driver (better-sqlite3, postgres, mysql2, etc.)
       └─> Configure paths and options
   └─> createFiles() - generates configuration files
       └─> drizzle.config.ts
       └─> db/index.ts (database client)
       └─> db/schema.ts (empty schema)
       └─> .env.example (optional)
       └─> docker-compose.yml (optional)
   └─> addScriptsToPackageJson() - adds db:* scripts
   └─> installDependencies() - runs npm/pnpm/yarn install
   └─> showSummary() - displays next steps
```

### Scaffold Command

When a user runs `brizzle scaffold post title:string body:text`:

```
1. CLI Layer
   └─> Parse command arguments (Commander.js)
   └─> Validate options
   └─> Call generateScaffold()

2. Generator Layer (scaffold.ts)
   └─> validateModelName("post")
   └─> createModelContext("post") → ModelContext
   └─> parseFields(["title:string", "body:text"]) → Field[]
   └─> generateModel() - creates schema.ts table
   └─> generateActions() - creates CRUD server actions
   └─> generatePages() - creates 4 page components

3. Utility Layer
   └─> detectDialect() - reads drizzle.config.ts
   └─> detectProjectConfig() - reads tsconfig.json
   └─> drizzleType() - maps field types to Drizzle types
   └─> writeFile() - writes files with logging
```

## Module Responsibilities

### CLI Layer (`src/index.ts`)

- Defines CLI commands using Commander.js
- Parses command-line arguments
- Handles errors with user-friendly messages
- Routes to appropriate generators

### Generator Layer (`src/generators/`)

| Module | Responsibility |
|--------|---------------|
| `init.ts` | Interactive Drizzle ORM setup wizard |
| `init/` | Init submodules (types, drivers, templates, prompts) |
| `model.ts` | Generates Drizzle schema table definitions |
| `actions.ts` | Generates Next.js server actions (CRUD) |
| `scaffold.ts` | Orchestrates full CRUD generation |
| `resource.ts` | Generates model + actions (no UI) |
| `api.ts` | Generates REST API route handlers |
| `destroy.ts` | Removes generated files |
| `pages/` | Page template generators |

### Utility Layer (`src/lib/`)

| Module | Responsibility |
|--------|---------------|
| `types.ts` | TypeScript interfaces and type definitions |
| `config.ts` | Project structure and dialect detection |
| `drizzle/` | Drizzle ORM type mappings and helpers |
| `forms.ts` | HTML form field generation |
| `strings.ts` | String transformations (case, pluralize) |
| `validation.ts` | Input validation and error messages |
| `parsing.ts` | Field definition parsing |
| `files.ts` | File system operations |
| `logger.ts` | Colored console output |

## Init Module Architecture

The `init` generator has a modular structure for maintainability:

```
src/generators/
├── init.ts              # Main entry point, orchestration
└── init/
    ├── types.ts         # Driver, InitOptions, DriverConfig interfaces
    ├── drivers.ts       # DRIVERS registry, getDriverConfig(), etc.
    ├── templates.ts     # File content generators (config, client, schema)
    └── prompts.ts       # @clack/prompts interactive flow, utilities
```

| Module | Responsibility |
|--------|---------------|
| `types.ts` | Type definitions for drivers and options |
| `drivers.ts` | Driver configurations for 10 supported drivers |
| `templates.ts` | Template generators for all output files |
| `prompts.ts` | Interactive prompts, dependency installation, summary |

## Design Patterns

### Composition Over Inheritance

Generators are composed of smaller functions rather than inheriting from a base class:

```typescript
// scaffold.ts composes model and actions
export function generateScaffold(...) {
  generateModel(...);
  generateActions(...);
  generatePages(...);
}
```

### Strategy Pattern (Dialect Handling)

Different database dialects are handled through type maps:

```typescript
// drizzle/types.ts
const SQLITE_TYPE_MAP = { string: "text", ... };
const POSTGRESQL_TYPE_MAP = { string: "text", ... };
const MYSQL_TYPE_MAP = { string: "varchar", ... };

export function drizzleType(field, dialect) {
  const map = dialect === "postgresql" ? POSTGRESQL_TYPE_MAP : ...;
  return map[field.type];
}
```

### Factory Pattern (ModelContext)

All naming variations are created from a single input:

```typescript
// strings.ts
export function createModelContext(name: string): ModelContext {
  const singular = singularize(name);
  return {
    singularName: singular,
    pascalName: toPascalCase(singular),
    camelName: toCamelCase(singular),
    // ... all variations
  };
}
```

## Schema Management

When generating a model, Brizzle handles the schema file intelligently:

1. **Create**: If `schema.ts` doesn't exist, create it with imports and table
2. **Append**: If `schema.ts` exists and model is new, merge imports and append table
3. **Replace**: If `schema.ts` exists and `--force` is used, remove old table and add new

Import merging ensures no duplicate imports:

```typescript
// Before: import { text, integer } from "drizzle-orm/sqlite-core";
// Adding: boolean field
// After:  import { text, integer, boolean } from "drizzle-orm/sqlite-core";
```

## Testing Strategy

Tests are co-located with source files:

```
src/
├── generators/
│   ├── model.ts
│   └── tests/
│       └── model.test.ts
└── lib/
    ├── strings.ts
    └── tests/
        └── strings.test.ts
```

File system operations are mocked in tests:

```typescript
vi.mock("fs", () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));
```

## Extending Brizzle

### Adding a New Field Type

1. Add to `VALID_FIELD_TYPES` in `types.ts`
2. Add mappings in `drizzle/types.ts` for all dialects
3. Handle in `forms.ts` for form generation
4. Add tests

### Adding a New Generator

1. Create `src/generators/myfeature.ts`
2. Export main function with JSDoc
3. Register command in `src/index.ts`
4. Add tests in `src/generators/tests/`

### Adding a New Dialect

1. Add to `Dialect` type in `types.ts`
2. Add type map in `drizzle/types.ts`
3. Handle in `drizzle/columns.ts` for column generation
4. Handle in `drizzle/imports.ts` for import paths
5. Update `config.ts` dialect detection
