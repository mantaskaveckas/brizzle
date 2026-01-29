import { generateModel } from "./model";
import { generateActions } from "./actions";
import {
  validateModelName,
  createModelContext,
  getRunCommand,
  log,
  GeneratorOptions,
} from "../lib";

/**
 * Generates a resource (model + actions) without UI pages.
 *
 * Creates the schema model and server actions, but no page components.
 * Useful for API-only resources or when building custom UIs.
 *
 * @param name - Model name (singular, e.g., "session")
 * @param fieldArgs - Array of field definitions (e.g., ["token:uuid", "userId:references:user"])
 * @param options - Generation options (force, dryRun, uuid, noTimestamps)
 * @throws {Error} If model name is invalid or reserved
 * @example
 * generateResource("session", ["token:uuid", "userId:references:user"], { uuid: true });
 */
export function generateResource(
  name: string,
  fieldArgs: string[],
  options: GeneratorOptions = {}
): void {
  validateModelName(name);

  const ctx = createModelContext(name);
  const prefix = options.dryRun ? "[dry-run] " : "";

  log.info(`\n${prefix}Generating resource ${ctx.pascalName}...\n`);

  generateModel(ctx.singularName, fieldArgs, options);
  generateActions(ctx.singularName, options);

  const run = getRunCommand();
  log.info(`\nNext steps:`);
  log.info(`  1. Run '${run} db:push' to update the database`);
  log.info(`  2. Create pages in app/${ctx.kebabPlural}/`);
}
