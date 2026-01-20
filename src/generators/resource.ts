import { generateModel } from "./model";
import { generateActions } from "./actions";
import {
  validateModelName,
  createModelContext,
  log,
  GeneratorOptions,
} from "../lib";

export function generateResource(name: string, fieldArgs: string[], options: GeneratorOptions = {}): void {
  validateModelName(name);

  const ctx = createModelContext(name);
  const prefix = options.dryRun ? "[dry-run] " : "";

  log.info(`\n${prefix}Generating resource ${ctx.pascalName}...\n`);

  generateModel(ctx.singularName, fieldArgs, options);
  generateActions(ctx.singularName, options);

  log.info(`\nNext steps:`);
  log.info(`  1. Run 'pnpm db:push' to update the database`);
  log.info(`  2. Create pages in app/${ctx.kebabPlural}/`);
}
