export interface Field {
  name: string;
  type: string;
  isReference: boolean;
  referenceTo?: string;
  isEnum: boolean;
  enumValues?: string[];
  nullable: boolean;
  unique: boolean;
}

export interface GeneratorOptions {
  force?: boolean;
  dryRun?: boolean;
  uuid?: boolean;
  noTimestamps?: boolean;
}

export interface ModelContext {
  name: string;
  singularName: string;
  pluralName: string;
  pascalName: string;
  pascalPlural: string;
  camelName: string;
  camelPlural: string;
  snakeName: string;
  snakePlural: string;
  kebabName: string;
  kebabPlural: string;
  tableName: string;
}

export interface ProjectConfig {
  /** Whether the project uses src/ directory (e.g., src/app/) */
  useSrc: boolean;
  /** Path alias prefix (e.g., "@", "~", "@src") */
  alias: string;
  /** Relative path to db directory from project root (e.g., "db", "src/db", "lib/db") */
  dbPath: string;
  /** Relative path to app directory from project root (e.g., "app", "src/app") */
  appPath: string;
}

export type Dialect = "sqlite" | "postgresql" | "mysql";

export const VALID_FIELD_TYPES = [
  "string",
  "text",
  "integer",
  "int",
  "bigint",
  "boolean",
  "bool",
  "datetime",
  "timestamp",
  "date",
  "float",
  "decimal",
  "json",
  "uuid",
] as const;
