import * as fs from "fs";
import * as path from "path";
import type { Dialect, ProjectConfig } from "./types";

let cachedProjectConfig: ProjectConfig | null = null;

export function detectDialect(): Dialect {
  const configPath = path.join(process.cwd(), "drizzle.config.ts");

  if (!fs.existsSync(configPath)) {
    return "sqlite"; // default
  }

  const content = fs.readFileSync(configPath, "utf-8");

  // Match dialect: "value" or dialect: 'value'
  const match = content.match(/dialect:\s*["'](\w+)["']/);

  if (match) {
    const dialect = match[1];
    if (["postgresql", "postgres", "pg"].includes(dialect)) {
      return "postgresql";
    }
    if (["mysql", "mysql2"].includes(dialect)) {
      return "mysql";
    }
  }

  // turso, sqlite, libsql, better-sqlite3 are all SQLite-based
  return "sqlite";
}

export function detectProjectConfig(): ProjectConfig {
  if (cachedProjectConfig) {
    return cachedProjectConfig;
  }

  const cwd = process.cwd();

  // Detect if src/ directory is used
  const useSrc = fs.existsSync(path.join(cwd, "src", "app"));

  // Detect path alias from tsconfig.json
  let alias = "@";
  const tsconfigPath = path.join(cwd, "tsconfig.json");
  if (fs.existsSync(tsconfigPath)) {
    try {
      const content = fs.readFileSync(tsconfigPath, "utf-8");
      // Remove comments for parsing (simple approach for single-line comments)
      const cleanContent = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
      const tsconfig = JSON.parse(cleanContent);

      // Look for path aliases like "@/*", "~/*", "@src/*"
      const paths = tsconfig?.compilerOptions?.paths;
      if (paths) {
        for (const key of Object.keys(paths)) {
          // Match patterns like "@/*" or "~/*"
          const match = key.match(/^(@\w*|~)\//);
          if (match) {
            alias = match[1];
            break;
          }
        }
      }
    } catch {
      // Ignore parse errors, use default
    }
  }

  // Detect db path - check common locations
  let dbPath = useSrc ? "src/db" : "db";
  const possibleDbPaths = useSrc
    ? ["src/db", "src/lib/db", "src/server/db"]
    : ["db", "lib/db", "server/db"];

  for (const possiblePath of possibleDbPaths) {
    if (fs.existsSync(path.join(cwd, possiblePath))) {
      dbPath = possiblePath;
      break;
    }
  }

  // App path
  const appPath = useSrc ? "src/app" : "app";

  cachedProjectConfig = { useSrc, alias, dbPath, appPath };
  return cachedProjectConfig;
}

/** Get import path for db (e.g., "@/db" or "~/db") */
export function getDbImport(): string {
  const config = detectProjectConfig();
  // Convert path like "src/db" to just "db" for the alias
  const importPath = config.dbPath.replace(/^src\//, "");
  return `${config.alias}/${importPath}`;
}

/** Get import path for db schema (e.g., "@/db/schema") */
export function getSchemaImport(): string {
  return `${getDbImport()}/schema`;
}

/** Get full filesystem path to app directory */
export function getAppPath(): string {
  const config = detectProjectConfig();
  return path.join(process.cwd(), config.appPath);
}

/** Get full filesystem path to db directory */
export function getDbPath(): string {
  const config = detectProjectConfig();
  return path.join(process.cwd(), config.dbPath);
}

/** Reset cached config (useful for testing) */
export function resetProjectConfig(): void {
  cachedProjectConfig = null;
}
