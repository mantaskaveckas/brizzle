# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-01-20

### Fixed

- `modelExistsInSchema()` now detects PostgreSQL (`pgTable`) and MySQL (`mysqlTable`) tables, not just SQLite
- Scaffold pages now validate numeric IDs before database queries (returns 404 for invalid IDs like `/posts/abc`)
- Actions generator now uses correct ID type (`string` for UUID, `number` for auto-increment)
- API routes now use correct ID type based on `--uuid` flag

### Changed

- API routes now log errors with route context (e.g., `GET /api/posts failed:`)
- API routes return 400 for invalid JSON in request body
- API routes return 400 for invalid ID format (non-numeric when expecting number)
- Refactored `utils.ts` into modular `src/lib/` structure for better maintainability
- Colocated tests with source code (`src/**/tests/`)

## [0.1.0] - 2026-01-20

### Added

- Initial release
- `model` generator - creates Drizzle schema models
- `actions` generator - creates server actions for CRUD operations
- `scaffold` generator - creates model + actions + CRUD pages
- `resource` generator - creates model + actions (no UI)
- `api` generator - creates model + REST API routes
- `destroy` command - removes generated files
- `config` command - shows detected project configuration
- Auto-detection of project structure (`src/app` vs `app`)
- Auto-detection of path aliases from `tsconfig.json`
- Auto-detection of database dialect from `drizzle.config.ts`
- Support for SQLite, PostgreSQL, and MySQL
- Field types: string, text, integer, bigint, boolean, float, decimal, datetime, date, json, uuid
- Field modifiers: nullable (`?`), unique (`:unique`)
- Special types: enum, references (foreign keys)
- Options: `--force`, `--dry-run`, `--uuid`, `--no-timestamps`
