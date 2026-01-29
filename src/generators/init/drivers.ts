/**
 * Database driver configurations for brizzle init.
 * @module init/drivers
 */

import type { Dialect } from "../../lib/types";
import type { DriverConfig, Driver } from "./types";

/**
 * Configuration registry for all supported database drivers.
 * Maps driver identifiers to their full configuration objects.
 */
export const DRIVERS: Record<Driver, DriverConfig> = {
  // SQLite drivers
  "better-sqlite3": {
    name: "better-sqlite3",
    driver: "better-sqlite3",
    dialect: "sqlite",
    package: "better-sqlite3",
    drizzleKitDriver: "better-sqlite",
    envVar: "DATABASE_URL",
    envExample: "./sqlite.db",
    hint: "Local file-based SQLite",
    requiresUrl: false,
  },
  libsql: {
    name: "Turso / LibSQL",
    driver: "libsql",
    dialect: "sqlite",
    package: "@libsql/client",
    drizzleKitDriver: "turso",
    envVar: "DATABASE_URL",
    envExample: "libsql://your-database.turso.io",
    hint: "Turso edge database or local LibSQL",
    requiresUrl: true,
  },
  "bun:sqlite": {
    name: "Bun SQLite",
    driver: "bun:sqlite",
    dialect: "sqlite",
    package: "",
    drizzleKitDriver: "bun:sqlite",
    envVar: "DATABASE_URL",
    envExample: "./sqlite.db",
    hint: "Bun's built-in SQLite driver",
    requiresUrl: false,
  },

  // PostgreSQL drivers
  postgres: {
    name: "postgres.js",
    driver: "postgres",
    dialect: "postgresql",
    package: "postgres",
    envVar: "DATABASE_URL",
    envExample: "postgres://user:password@localhost:5432/mydb",
    hint: "Recommended for most PostgreSQL setups",
    requiresUrl: true,
  },
  pg: {
    name: "node-postgres (pg)",
    driver: "pg",
    dialect: "postgresql",
    package: "pg",
    envVar: "DATABASE_URL",
    envExample: "postgres://user:password@localhost:5432/mydb",
    hint: "Traditional Node.js PostgreSQL driver",
    requiresUrl: true,
  },
  neon: {
    name: "Neon Serverless",
    driver: "neon",
    dialect: "postgresql",
    package: "@neondatabase/serverless",
    drizzleKitDriver: "neon-http",
    envVar: "DATABASE_URL",
    envExample: "postgres://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb",
    hint: "Neon serverless PostgreSQL",
    requiresUrl: true,
  },
  "vercel-postgres": {
    name: "Vercel Postgres",
    driver: "vercel-postgres",
    dialect: "postgresql",
    package: "@vercel/postgres",
    drizzleKitDriver: "vercel-postgres",
    envVar: "POSTGRES_URL",
    envExample: "postgres://...",
    hint: "Vercel's managed PostgreSQL",
    requiresUrl: true,
  },

  // MySQL drivers
  mysql2: {
    name: "mysql2",
    driver: "mysql2",
    dialect: "mysql",
    package: "mysql2",
    envVar: "DATABASE_URL",
    envExample: "mysql://user:password@localhost:3306/mydb",
    hint: "Standard MySQL/MariaDB driver",
    requiresUrl: true,
  },
  planetscale: {
    name: "PlanetScale",
    driver: "planetscale",
    dialect: "mysql",
    package: "@planetscale/database",
    drizzleKitDriver: "planetscale",
    envVar: "DATABASE_URL",
    envExample:
      'mysql://xxx:pscale_pw_xxx@aws.connect.psdb.cloud/mydb?ssl={"rejectUnauthorized":true}',
    hint: "PlanetScale serverless MySQL",
    requiresUrl: true,
  },
};

/**
 * Get all drivers available for a specific dialect.
 *
 * @param dialect - The database dialect (sqlite, postgresql, mysql)
 * @returns Array of driver configurations for the dialect
 *
 * @example
 * const sqliteDrivers = getDriversForDialect("sqlite");
 * // Returns configs for better-sqlite3, libsql, bun:sqlite
 */
export function getDriversForDialect(dialect: Dialect): DriverConfig[] {
  return Object.values(DRIVERS).filter((d) => d.dialect === dialect);
}

/**
 * Get the configuration for a specific driver.
 *
 * @param driver - The driver identifier
 * @returns The driver's configuration object
 */
export function getDriverConfig(driver: Driver): DriverConfig {
  return DRIVERS[driver];
}

/**
 * Type guard to validate a driver string.
 *
 * @param driver - String to validate
 * @returns True if the string is a valid Driver type
 */
export function isValidDriver(driver: string): driver is Driver {
  return driver in DRIVERS;
}

/**
 * Check if a driver is compatible with a dialect.
 *
 * @param driver - The driver to check
 * @param dialect - The dialect to check against
 * @returns True if the driver works with the dialect
 */
export function isDriverForDialect(driver: Driver, dialect: Dialect): boolean {
  return DRIVERS[driver].dialect === dialect;
}
