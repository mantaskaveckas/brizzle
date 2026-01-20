// Types
export type { Field, GeneratorOptions, ModelContext, ProjectConfig, Dialect } from "./types";
export { VALID_FIELD_TYPES } from "./types";

// Config
export {
  detectDialect,
  detectProjectConfig,
  getDbImport,
  getSchemaImport,
  getAppPath,
  getDbPath,
  resetProjectConfig,
} from "./config";

// Logger
export { log } from "./logger";

// Strings
export {
  toPascalCase,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  pluralize,
  singularize,
  createModelContext,
} from "./strings";

// Validation
export { validateModelName, validateFieldDefinition } from "./validation";

// Parsing
export { parseFields } from "./parsing";

// Drizzle
export {
  drizzleType,
  getDrizzleImport,
  getTableFunction,
  getIdColumn,
  getTimestampColumns,
  getRequiredImports,
} from "./drizzle";

// Files
export {
  writeFile,
  deleteDirectory,
  fileExists,
  readFile,
  modelExistsInSchema,
} from "./files";
