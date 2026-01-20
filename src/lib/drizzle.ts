import type { Dialect, Field, GeneratorOptions } from "./types";

const SQLITE_TYPE_MAP: Record<string, string> = {
  string: "text",
  text: "text",
  integer: "integer",
  int: "integer",
  bigint: "integer", // SQLite doesn't distinguish
  boolean: 'integer({ mode: "boolean" })',
  bool: 'integer({ mode: "boolean" })',
  datetime: 'integer({ mode: "timestamp" })',
  timestamp: 'integer({ mode: "timestamp" })',
  date: 'integer({ mode: "timestamp" })',
  float: "real",
  decimal: "text", // SQLite has no native decimal
  json: "text", // Store as JSON string
  uuid: "text", // Store as text
};

const POSTGRESQL_TYPE_MAP: Record<string, string> = {
  string: "text",
  text: "text",
  integer: "integer",
  int: "integer",
  bigint: "bigint",
  boolean: "boolean",
  bool: "boolean",
  datetime: "timestamp",
  timestamp: "timestamp",
  date: "date",
  float: "doublePrecision",
  decimal: "numeric",
  json: "jsonb",
  uuid: "uuid",
};

const MYSQL_TYPE_MAP: Record<string, string> = {
  string: "varchar",
  text: "text",
  integer: "int",
  int: "int",
  bigint: "bigint",
  boolean: "boolean",
  bool: "boolean",
  datetime: "datetime",
  timestamp: "timestamp",
  date: "date",
  float: "double",
  decimal: "decimal",
  json: "json",
  uuid: "varchar", // Store as varchar(36)
};

export function drizzleType(field: Field, dialect: Dialect = "sqlite"): string {
  const typeMap =
    dialect === "postgresql"
      ? POSTGRESQL_TYPE_MAP
      : dialect === "mysql"
        ? MYSQL_TYPE_MAP
        : SQLITE_TYPE_MAP;
  return typeMap[field.type] || "text";
}

export function getDrizzleImport(dialect: Dialect): string {
  switch (dialect) {
    case "postgresql":
      return "drizzle-orm/pg-core";
    case "mysql":
      return "drizzle-orm/mysql-core";
    default:
      return "drizzle-orm/sqlite-core";
  }
}

export function getTableFunction(dialect: Dialect): string {
  switch (dialect) {
    case "postgresql":
      return "pgTable";
    case "mysql":
      return "mysqlTable";
    default:
      return "sqliteTable";
  }
}

export function getIdColumn(dialect: Dialect, useUuid = false): string {
  if (useUuid) {
    switch (dialect) {
      case "postgresql":
        return 'id: uuid("id").primaryKey().defaultRandom()';
      case "mysql":
        return 'id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID())';
      default:
        return 'id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID())';
    }
  }

  switch (dialect) {
    case "postgresql":
      return 'id: serial("id").primaryKey()';
    case "mysql":
      return 'id: int("id").primaryKey().autoincrement()';
    default:
      return 'id: integer("id").primaryKey({ autoIncrement: true })';
  }
}

export function getTimestampColumns(dialect: Dialect, noTimestamps = false): string | null {
  if (noTimestamps) {
    return null;
  }

  switch (dialect) {
    case "postgresql":
      return `createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()`;
    case "mysql":
      return `createdAt: datetime("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: datetime("updated_at")
    .notNull()
    .$defaultFn(() => new Date())`;
    default:
      return `createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())`;
  }
}

export function getRequiredImports(fields: Field[], dialect: Dialect, options: GeneratorOptions = {}): string[] {
  const types = new Set<string>();

  // Add table function
  types.add(getTableFunction(dialect));

  // Add types needed for id
  if (options.uuid) {
    if (dialect === "postgresql") {
      types.add("uuid");
    } else if (dialect === "mysql") {
      types.add("varchar");
    } else {
      types.add("text");
    }
  } else {
    if (dialect === "postgresql") {
      types.add("serial");
    } else if (dialect === "mysql") {
      types.add("int");
    } else {
      types.add("integer");
    }
  }

  // Add types needed for timestamps (if not disabled)
  if (!options.noTimestamps) {
    if (dialect === "postgresql") {
      types.add("timestamp");
    } else if (dialect === "mysql") {
      types.add("datetime");
    }
    // SQLite uses integer which is already added
  }

  // Check for enum fields
  const hasEnums = fields.some((f) => f.isEnum);
  if (hasEnums) {
    if (dialect === "postgresql") {
      types.add("pgEnum");
    } else if (dialect === "mysql") {
      types.add("mysqlEnum");
    }
  }

  // Add types for user fields
  for (const field of fields) {
    // Skip enum fields - they're handled separately
    if (field.isEnum) continue;

    const drizzleTypeDef = drizzleType(field, dialect);
    // Extract the base type name (before any parentheses)
    const baseType = drizzleTypeDef.split("(")[0];
    types.add(baseType);
  }

  // Add text as it's commonly needed (except MySQL uses varchar for strings)
  // SQLite also needs text for enums
  if (dialect !== "mysql") {
    types.add("text");
  }

  return Array.from(types);
}
