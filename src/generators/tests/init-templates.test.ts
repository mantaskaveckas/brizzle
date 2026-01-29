import { describe, it, expect } from "vitest";
import {
  generateDrizzleConfig,
  generateDbClient,
  generateSchema,
  generateEnvExample,
  generateDockerCompose,
} from "../init/templates";
import type { InitOptions } from "../init/types";

const baseOptions: InitOptions = {
  dialect: "sqlite",
  driver: "better-sqlite3",
  dbPath: "db",
  createEnvFile: true,
  createDockerCompose: false,
  installDeps: false,
};

describe("init/templates", () => {
  describe("generateDrizzleConfig", () => {
    it("generates correct config for SQLite", () => {
      const config = generateDrizzleConfig(baseOptions);

      expect(config).toContain('import { defineConfig } from "drizzle-kit"');
      expect(config).toContain('schema: "./db/schema.ts"');
      expect(config).toContain('out: "./db/migrations"');
      expect(config).toContain('dialect: "sqlite"');
      expect(config).toContain("process.env.DATABASE_URL");
    });

    it("generates correct config for PostgreSQL", () => {
      const config = generateDrizzleConfig({
        ...baseOptions,
        dialect: "postgresql",
        driver: "postgres",
      });

      expect(config).toContain('dialect: "postgresql"');
      expect(config).toContain("process.env.DATABASE_URL");
    });

    it("generates correct config for MySQL", () => {
      const config = generateDrizzleConfig({
        ...baseOptions,
        dialect: "mysql",
        driver: "mysql2",
      });

      expect(config).toContain('dialect: "mysql"');
    });

    it("uses correct dbPath in schema path", () => {
      const config = generateDrizzleConfig({
        ...baseOptions,
        dbPath: "src/db",
      });

      expect(config).toContain('schema: "./src/db/schema.ts"');
      expect(config).toContain('out: "./src/db/migrations"');
    });

    it("uses correct env var for Vercel Postgres", () => {
      const config = generateDrizzleConfig({
        ...baseOptions,
        dialect: "postgresql",
        driver: "vercel-postgres",
      });

      expect(config).toContain("process.env.POSTGRES_URL");
    });
  });

  describe("generateDbClient", () => {
    it("generates better-sqlite3 client correctly", () => {
      const client = generateDbClient(baseOptions);

      expect(client).toContain('import Database from "better-sqlite3"');
      expect(client).toContain('import { drizzle } from "drizzle-orm/better-sqlite3"');
      expect(client).toContain('import * as schema from "./schema"');
      expect(client).toContain("export const db = drizzle");
    });

    it("generates libsql client correctly", () => {
      const client = generateDbClient({
        ...baseOptions,
        driver: "libsql",
      });

      expect(client).toContain('import { createClient } from "@libsql/client"');
      expect(client).toContain('import { drizzle } from "drizzle-orm/libsql"');
      expect(client).toContain("DATABASE_AUTH_TOKEN");
    });

    it("generates postgres.js client correctly", () => {
      const client = generateDbClient({
        ...baseOptions,
        dialect: "postgresql",
        driver: "postgres",
      });

      expect(client).toContain('import postgres from "postgres"');
      expect(client).toContain('import { drizzle } from "drizzle-orm/postgres-js"');
    });

    it("generates node-postgres client correctly", () => {
      const client = generateDbClient({
        ...baseOptions,
        dialect: "postgresql",
        driver: "pg",
      });

      expect(client).toContain('import { Pool } from "pg"');
      expect(client).toContain('import { drizzle } from "drizzle-orm/node-postgres"');
    });

    it("generates neon client correctly", () => {
      const client = generateDbClient({
        ...baseOptions,
        dialect: "postgresql",
        driver: "neon",
      });

      expect(client).toContain('import { neon } from "@neondatabase/serverless"');
      expect(client).toContain('import { drizzle } from "drizzle-orm/neon-http"');
    });

    it("generates vercel-postgres client correctly", () => {
      const client = generateDbClient({
        ...baseOptions,
        dialect: "postgresql",
        driver: "vercel-postgres",
      });

      expect(client).toContain('import { sql } from "@vercel/postgres"');
      expect(client).toContain('import { drizzle } from "drizzle-orm/vercel-postgres"');
    });

    it("generates mysql2 client correctly", () => {
      const client = generateDbClient({
        ...baseOptions,
        dialect: "mysql",
        driver: "mysql2",
      });

      expect(client).toContain('import mysql from "mysql2/promise"');
      expect(client).toContain('import { drizzle } from "drizzle-orm/mysql2"');
    });

    it("generates mysql2 client with mode: default", () => {
      const client = generateDbClient({
        ...baseOptions,
        dialect: "mysql",
        driver: "mysql2",
      });

      expect(client).toContain('mode: "default"');
    });

    it("generates planetscale client correctly", () => {
      const client = generateDbClient({
        ...baseOptions,
        dialect: "mysql",
        driver: "planetscale",
      });

      expect(client).toContain('import { connect } from "@planetscale/database"');
      expect(client).toContain('import { drizzle } from "drizzle-orm/planetscale-serverless"');
    });

    it("generates planetscale client with mode: planetscale", () => {
      const client = generateDbClient({
        ...baseOptions,
        dialect: "mysql",
        driver: "planetscale",
      });

      expect(client).toContain('mode: "planetscale"');
    });

    it("generates bun:sqlite client correctly", () => {
      const client = generateDbClient({
        ...baseOptions,
        driver: "bun:sqlite",
      });

      expect(client).toContain('import { Database } from "bun:sqlite"');
      expect(client).toContain('import { drizzle } from "drizzle-orm/bun-sqlite"');
    });
  });

  describe("generateSchema", () => {
    it("generates correct schema for SQLite", () => {
      const schema = generateSchema("sqlite");

      expect(schema).toContain('import { sqliteTable } from "drizzle-orm/sqlite-core"');
      expect(schema).toContain("npx brizzle scaffold");
    });

    it("generates correct schema for PostgreSQL", () => {
      const schema = generateSchema("postgresql");

      expect(schema).toContain('import { pgTable } from "drizzle-orm/pg-core"');
    });

    it("generates correct schema for MySQL", () => {
      const schema = generateSchema("mysql");

      expect(schema).toContain('import { mysqlTable } from "drizzle-orm/mysql-core"');
    });

    it("does not contain commented example that could be detected as existing model", () => {
      const schema = generateSchema("sqlite");

      // Should not contain example table that could be falsely detected
      expect(schema).not.toContain("export const users");
      expect(schema).not.toContain('sqliteTable("users"');
    });
  });

  describe("generateEnvExample", () => {
    it("generates correct env for SQLite", () => {
      const env = generateEnvExample(baseOptions);

      expect(env).toContain("DATABASE_URL");
      expect(env).toContain("./sqlite.db");
    });

    it("generates correct env for PostgreSQL", () => {
      const env = generateEnvExample({
        ...baseOptions,
        dialect: "postgresql",
        driver: "postgres",
      });

      expect(env).toContain("DATABASE_URL");
      expect(env).toContain("postgres://");
    });

    it("generates correct env for libsql with auth token", () => {
      const env = generateEnvExample({
        ...baseOptions,
        driver: "libsql",
      });

      expect(env).toContain("DATABASE_URL");
      expect(env).toContain("DATABASE_AUTH_TOKEN");
    });

    it("uses POSTGRES_URL for Vercel Postgres", () => {
      const env = generateEnvExample({
        ...baseOptions,
        dialect: "postgresql",
        driver: "vercel-postgres",
      });

      expect(env).toContain("POSTGRES_URL");
    });

    it("uses docker-compose matching credentials for PostgreSQL when createDockerCompose is true", () => {
      const env = generateEnvExample({
        ...baseOptions,
        dialect: "postgresql",
        driver: "postgres",
        createDockerCompose: true,
      });

      expect(env).toContain("postgres://postgres:postgres@localhost:5432/myapp");
    });

    it("uses docker-compose matching credentials for MySQL when createDockerCompose is true", () => {
      const env = generateEnvExample({
        ...baseOptions,
        dialect: "mysql",
        driver: "mysql2",
        createDockerCompose: true,
      });

      expect(env).toContain("mysql://root:root@localhost:3306/myapp");
    });

    it("uses generic placeholder when createDockerCompose is false", () => {
      const env = generateEnvExample({
        ...baseOptions,
        dialect: "postgresql",
        driver: "postgres",
        createDockerCompose: false,
      });

      expect(env).toContain("postgres://user:password@localhost:5432/mydb");
    });
  });

  describe("generateDockerCompose", () => {
    it("returns null for SQLite", () => {
      const compose = generateDockerCompose("sqlite");
      expect(compose).toBeNull();
    });

    it("generates PostgreSQL docker-compose", () => {
      const compose = generateDockerCompose("postgresql");

      expect(compose).toContain("postgres:16-alpine");
      expect(compose).toContain("POSTGRES_USER");
      expect(compose).toContain("POSTGRES_PASSWORD");
      expect(compose).toContain("POSTGRES_DB");
      expect(compose).toContain("5432:5432");
    });

    it("generates MySQL docker-compose", () => {
      const compose = generateDockerCompose("mysql");

      expect(compose).toContain("mysql:8");
      expect(compose).toContain("MYSQL_ROOT_PASSWORD");
      expect(compose).toContain("MYSQL_DATABASE");
      expect(compose).toContain("3306:3306");
    });
  });
});
