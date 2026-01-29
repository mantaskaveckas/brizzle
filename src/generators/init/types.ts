/**
 * Type definitions for the brizzle init command.
 * @module init/types
 */

import type { Dialect } from "../../lib/types";

/**
 * Supported database drivers.
 *
 * SQLite drivers:
 * - `better-sqlite3` - Native SQLite for Node.js
 * - `libsql` - Turso/LibSQL for edge deployments
 * - `bun:sqlite` - Bun's built-in SQLite
 *
 * PostgreSQL drivers:
 * - `postgres` - postgres.js (recommended)
 * - `pg` - node-postgres
 * - `neon` - Neon serverless
 * - `vercel-postgres` - Vercel managed PostgreSQL
 *
 * MySQL drivers:
 * - `mysql2` - Standard MySQL driver
 * - `planetscale` - PlanetScale serverless
 */
export type Driver =
  // SQLite drivers
  | "better-sqlite3"
  | "libsql"
  | "bun:sqlite"
  // PostgreSQL drivers
  | "postgres"
  | "pg"
  | "neon"
  | "vercel-postgres"
  // MySQL drivers
  | "mysql2"
  | "planetscale";

/**
 * Configuration for a database driver.
 * Contains all metadata needed to set up and configure the driver.
 */
export interface DriverConfig {
  /** Display name for the driver (shown in prompts) */
  name: string;
  /** Driver identifier */
  driver: Driver;
  /** Database dialect */
  dialect: Dialect;
  /** npm package name to install */
  package: string;
  /** Driver name for drizzle.config.ts (if different from driver) */
  drizzleKitDriver?: string;
  /** Environment variable name for connection string */
  envVar: string;
  /** Example connection string */
  envExample: string;
  /** Helper text shown in selection prompt */
  hint?: string;
  /** Whether the driver requires a connection URL */
  requiresUrl: boolean;
}

/**
 * Options for the init generator.
 * These are resolved from either interactive prompts or CLI flags.
 */
export interface InitOptions {
  /** Database dialect (sqlite, postgresql, mysql) */
  dialect: Dialect;
  /** Database driver */
  driver: Driver;
  /** Path to database directory (e.g., "db" or "src/db") */
  dbPath: string;
  /** Whether to create/update .env.example */
  createEnvFile: boolean;
  /** Whether to generate docker-compose.yml (PostgreSQL/MySQL only) */
  createDockerCompose: boolean;
  /** Whether to automatically install dependencies */
  installDeps: boolean;
  /** Overwrite existing files without prompting */
  force?: boolean;
  /** Preview changes without writing files */
  dryRun?: boolean;
}

/**
 * Raw CLI options passed to the init command.
 * These are parsed and validated before creating InitOptions.
 */
export interface InitCommandOptions {
  /** Overwrite existing files without prompting */
  force?: boolean;
  /** Preview changes without writing files */
  dryRun?: boolean;
  /** Database dialect for non-interactive mode */
  dialect?: string;
  /** Database driver for non-interactive mode */
  driver?: string;
  /** Auto-install dependencies (default: true) */
  install?: boolean;
}
