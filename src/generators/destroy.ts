import * as path from "path";
import {
  validateModelName,
  createModelContext,
  deleteDirectory,
  getAppPath,
  detectProjectConfig,
  log,
  GeneratorOptions,
} from "../lib";

export function destroyScaffold(name: string, options: GeneratorOptions = {}): void {
  validateModelName(name);

  const ctx = createModelContext(name);
  const config = detectProjectConfig();
  const prefix = options.dryRun ? "[dry-run] " : "";

  log.info(`\n${prefix}Destroying scaffold ${ctx.pascalName}...\n`);

  const basePath = path.join(getAppPath(), ctx.kebabPlural);
  deleteDirectory(basePath, options);

  log.info(`\nNote: Schema in ${config.dbPath}/schema.ts was not modified.`);
  log.info(`      Remove the table definition manually if needed.`);
}

export function destroyResource(name: string, options: GeneratorOptions = {}): void {
  validateModelName(name);

  const ctx = createModelContext(name);
  const config = detectProjectConfig();
  const prefix = options.dryRun ? "[dry-run] " : "";

  log.info(`\n${prefix}Destroying resource ${ctx.pascalName}...\n`);

  const basePath = path.join(getAppPath(), ctx.kebabPlural);
  deleteDirectory(basePath, options);

  log.info(`\nNote: Schema in ${config.dbPath}/schema.ts was not modified.`);
  log.info(`      Remove the table definition manually if needed.`);
}

export function destroyApi(name: string, options: GeneratorOptions = {}): void {
  validateModelName(name);

  const ctx = createModelContext(name);
  const config = detectProjectConfig();
  const prefix = options.dryRun ? "[dry-run] " : "";

  log.info(`\n${prefix}Destroying API ${ctx.pascalName}...\n`);

  const basePath = path.join(getAppPath(), "api", ctx.kebabPlural);
  deleteDirectory(basePath, options);

  log.info(`\nNote: Schema in ${config.dbPath}/schema.ts was not modified.`);
  log.info(`      Remove the table definition manually if needed.`);
}
