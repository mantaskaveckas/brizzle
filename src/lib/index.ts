// Types
export type {
  Field,
  GeneratorOptions,
  ModelContext,
  ProjectConfig,
  Dialect,
  DestroyType,
} from "./types";
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
  detectPackageManager,
  getRunCommand,
  type PackageManager,
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
  escapeString,
  createModelContext,
} from "./strings";

// Validation
export { validateModelName, validateFieldDefinition, validateReferences } from "./validation";

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
  extractImportsFromSchema,
  updateSchemaImports,
} from "./drizzle/index";

// Files
export {
  writeFile,
  deleteDirectory,
  fileExists,
  readFile,
  modelExistsInSchema,
  removeModelFromSchemaContent,
} from "./files";

// Forms
export { generateFormField, formDataValue, createFieldContext, type FieldContext } from "./forms";
