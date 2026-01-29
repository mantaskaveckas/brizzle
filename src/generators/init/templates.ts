/**
 * Template generators for brizzle init.
 * Generates content for drizzle.config.ts, db client, schema, env, and docker-compose.
 * @module init/templates
 */

import type { Dialect } from "../../lib/types";
import type { InitOptions } from "./types";
import { getDriverConfig } from "./drivers";
import { getDrizzleImport, getTableFunction } from "../../lib/drizzle";

/**
 * Generate drizzle.config.ts content.
 *
 * @param options - Init options containing dialect, driver, and dbPath
 * @returns TypeScript content for drizzle.config.ts
 */
export function generateDrizzleConfig(options: InitOptions): string {
  const config = getDriverConfig(options.driver);

  return `import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./${options.dbPath}/schema.ts",
  out: "./${options.dbPath}/migrations",
  dialect: "${options.dialect}",
  dbCredentials: {
    url: process.env.${config.envVar}!,
  },
});
`;
}

/**
 * Generate db/index.ts content based on the selected driver.
 * Each driver has a unique client initialization pattern.
 *
 * @param options - Init options containing the driver selection
 * @returns TypeScript content for db/index.ts
 * @throws Error if driver is not supported
 */
export function generateDbClient(options: InitOptions): string {
  switch (options.driver) {
    case "better-sqlite3":
      return generateBetterSqliteClient(options);
    case "libsql":
      return generateLibsqlClient(options);
    case "bun:sqlite":
      return generateBunSqliteClient(options);
    case "postgres":
      return generatePostgresJsClient(options);
    case "pg":
      return generatePgClient(options);
    case "neon":
      return generateNeonClient(options);
    case "vercel-postgres":
      return generateVercelPgClient(options);
    case "mysql2":
      return generateMysql2Client(options);
    case "planetscale":
      return generatePlanetscaleClient(options);
    default:
      throw new Error(`Unsupported driver: ${options.driver}`);
  }
}

function generateBetterSqliteClient(options: InitOptions): string {
  const config = getDriverConfig(options.driver);
  return `import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database(process.env.${config.envVar} || "sqlite.db");

export const db = drizzle(sqlite, { schema });
`;
}

function generateLibsqlClient(options: InitOptions): string {
  const config = getDriverConfig(options.driver);
  return `import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const client = createClient({
  url: process.env.${config.envVar}!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
`;
}

function generateBunSqliteClient(options: InitOptions): string {
  const config = getDriverConfig(options.driver);
  return `import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const sqlite = new Database(process.env.${config.envVar} || "sqlite.db");

export const db = drizzle(sqlite, { schema });
`;
}

function generatePostgresJsClient(options: InitOptions): string {
  const config = getDriverConfig(options.driver);
  return `import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const client = postgres(process.env.${config.envVar}!);

export const db = drizzle(client, { schema });
`;
}

function generatePgClient(options: InitOptions): string {
  const config = getDriverConfig(options.driver);
  return `import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.${config.envVar},
});

export const db = drizzle(pool, { schema });
`;
}

function generateNeonClient(options: InitOptions): string {
  const config = getDriverConfig(options.driver);
  return `import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.${config.envVar}!);

export const db = drizzle(sql, { schema });
`;
}

function generateVercelPgClient(_options: InitOptions): string {
  return `import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";

export const db = drizzle(sql, { schema });
`;
}

function generateMysql2Client(options: InitOptions): string {
  const config = getDriverConfig(options.driver);
  return `import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

const connection = await mysql.createConnection(process.env.${config.envVar}!);

export const db = drizzle(connection, { schema, mode: "default" });
`;
}

function generatePlanetscaleClient(options: InitOptions): string {
  const config = getDriverConfig(options.driver);
  return `import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import * as schema from "./schema";

const connection = connect({
  url: process.env.${config.envVar},
});

export const db = drizzle(connection, { schema, mode: "planetscale" });
`;
}

/**
 * Generate db/schema.ts content with the appropriate imports.
 *
 * @param dialect - Database dialect for correct import paths
 * @returns TypeScript content for db/schema.ts
 */
export function generateSchema(dialect: Dialect): string {
  const drizzleImport = getDrizzleImport(dialect);
  const tableFunction = getTableFunction(dialect);

  return `import { ${tableFunction} } from "${drizzleImport}";

// Scaffold your first CRUD: npx brizzle scaffold post title:string body:text
`;
}

/**
 * Generate .env.example content with database connection template.
 * When docker-compose is generated, uses matching credentials for local development.
 *
 * @param options - Init options containing driver and docker-compose flag
 * @returns Content for .env.example file
 */
export function generateEnvExample(options: InitOptions): string {
  const config = getDriverConfig(options.driver);

  let content = `# Database\n`;

  // Use docker-compose matching credentials when docker-compose is generated
  if (options.createDockerCompose) {
    if (options.dialect === "postgresql") {
      content += `${config.envVar}="postgres://postgres:postgres@localhost:5432/myapp"\n`;
    } else if (options.dialect === "mysql") {
      content += `${config.envVar}="mysql://root:root@localhost:3306/myapp"\n`;
    } else {
      content += `${config.envVar}="${config.envExample}"\n`;
    }
  } else {
    content += `${config.envVar}="${config.envExample}"\n`;
  }

  // Add auth token for Turso/LibSQL
  if (options.driver === "libsql") {
    content += `DATABASE_AUTH_TOKEN="your-auth-token"\n`;
  }

  return content;
}

/**
 * Generate docker-compose.yml content for PostgreSQL.
 * Uses postgres:16-alpine with default credentials.
 *
 * @returns YAML content for docker-compose.yml
 */
export function generatePostgresDockerCompose(): string {
  return `services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;
}

/**
 * Generate docker-compose.yml content for MySQL.
 * Uses mysql:8 with default credentials.
 *
 * @returns YAML content for docker-compose.yml
 */
export function generateMysqlDockerCompose(): string {
  return `services:
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: myapp
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
`;
}

/**
 * Generate docker-compose.yml content based on dialect.
 * Only PostgreSQL and MySQL support docker-compose generation.
 *
 * @param dialect - Database dialect
 * @returns YAML content for docker-compose.yml, or null for SQLite
 */
export function generateDockerCompose(dialect: Dialect): string | null {
  switch (dialect) {
    case "postgresql":
      return generatePostgresDockerCompose();
    case "mysql":
      return generateMysqlDockerCompose();
    default:
      return null;
  }
}
