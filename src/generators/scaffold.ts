import * as path from "path";
import { generateModel } from "./model";
import { generateActions } from "./actions";
import { generateIndexPage, generateNewPage, generateShowPage, generateEditPage } from "./pages";
import {
  parseFields,
  writeFile,
  validateModelName,
  createModelContext,
  getAppPath,
  getRunCommand,
  log,
  Field,
  GeneratorOptions,
  ModelContext,
} from "../lib";

/**
 * Generates a complete scaffold with model, actions, and CRUD pages.
 *
 * @param name - Model name (singular, e.g., "post")
 * @param fieldArgs - Array of field definitions (e.g., ["title:string", "body:text"])
 * @param options - Generation options (force, dryRun, uuid, noTimestamps)
 * @throws {Error} If model name is invalid or reserved
 * @example
 * generateScaffold("post", ["title:string", "body:text"], { uuid: true });
 */
export function generateScaffold(
  name: string,
  fieldArgs: string[],
  options: GeneratorOptions = {}
): void {
  validateModelName(name);

  const ctx = createModelContext(name);
  const fields = parseFields(fieldArgs);
  const prefix = options.dryRun ? "[dry-run] " : "";

  log.info(`\n${prefix}Scaffolding ${ctx.pascalName}...\n`);

  generateModel(ctx.singularName, fieldArgs, options);
  generateActions(ctx.singularName, options);
  generatePages(ctx, fields, options);

  const run = getRunCommand();
  log.info(`\nNext steps:`);
  log.info(`  1. Run '${run} db:push' to update the database`);
  log.info(`  2. Run '${run} dev' and visit /${ctx.kebabPlural}`);
}

function generatePages(ctx: ModelContext, fields: Field[], options: GeneratorOptions = {}): void {
  const { pascalName, pascalPlural, camelName, kebabPlural } = ctx;
  const basePath = path.join(getAppPath(), kebabPlural);

  // Index page (list)
  writeFile(
    path.join(basePath, "page.tsx"),
    generateIndexPage(pascalName, pascalPlural, camelName, kebabPlural, fields),
    options
  );

  // New page (create form)
  writeFile(
    path.join(basePath, "new", "page.tsx"),
    generateNewPage(pascalName, camelName, kebabPlural, fields),
    options
  );

  // Show page
  writeFile(
    path.join(basePath, "[id]", "page.tsx"),
    generateShowPage(pascalName, camelName, kebabPlural, fields, options),
    options
  );

  // Edit page
  writeFile(
    path.join(basePath, "[id]", "edit", "page.tsx"),
    generateEditPage(pascalName, camelName, kebabPlural, fields, options),
    options
  );
}
