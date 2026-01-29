/**
 * Main entry point for the brizzle init command.
 * Orchestrates the interactive setup wizard or non-interactive initialization.
 * @module generators/init
 */

import * as path from "path";
import { writeFile, readFile, log, detectProjectConfig, type Dialect } from "../lib";
import type { InitOptions, InitCommandOptions, Driver } from "./init/types";
import {
  runInitPrompts,
  promptOverwrite,
  showSummary,
  checkExistingFiles,
  installDependencies,
  addScriptsToPackageJson,
} from "./init/prompts";
import { getDriverConfig, isValidDriver, isDriverForDialect } from "./init/drivers";
import {
  generateDrizzleConfig,
  generateDbClient,
  generateSchema,
  generateEnvExample,
  generateDockerCompose,
} from "./init/templates";

/** Valid database dialects for validation */
const VALID_DIALECTS: Dialect[] = ["sqlite", "postgresql", "mysql"];

/**
 * Validate and convert a dialect string to the Dialect type.
 *
 * @param dialect - String to validate
 * @returns Valid Dialect type
 * @throws Error if dialect is invalid
 */
function validateDialect(dialect: string): Dialect {
  if (!VALID_DIALECTS.includes(dialect as Dialect)) {
    throw new Error(`Invalid dialect "${dialect}". Must be: ${VALID_DIALECTS.join(", ")}`);
  }
  return dialect as Dialect;
}

/**
 * Validate and convert a driver string to the Driver type.
 * Also ensures the driver is compatible with the selected dialect.
 *
 * @param driver - String to validate
 * @param dialect - Dialect the driver must be compatible with
 * @returns Valid Driver type
 * @throws Error if driver is invalid or incompatible
 */
function validateDriver(driver: string, dialect: Dialect): Driver {
  if (!isValidDriver(driver)) {
    throw new Error(`Invalid driver "${driver}".`);
  }
  if (!isDriverForDialect(driver, dialect)) {
    throw new Error(`Driver "${driver}" is not compatible with dialect "${dialect}".`);
  }
  return driver;
}

/**
 * Initialize Drizzle ORM in the current project.
 *
 * In interactive mode (default), runs a setup wizard that guides the user
 * through dialect, driver, and configuration options.
 *
 * In non-interactive mode (when --dialect and --driver are provided),
 * creates files with default options.
 *
 * @param commandOptions - CLI options (force, dryRun, dialect, driver, install)
 *
 * @example
 * // Interactive mode
 * await generateInit();
 *
 * @example
 * // Non-interactive mode
 * await generateInit({ dialect: "postgresql", driver: "postgres" });
 */
export async function generateInit(commandOptions: InitCommandOptions = {}): Promise<void> {
  let options: InitOptions;

  // If dialect and driver are provided, run in non-interactive mode
  if (commandOptions.dialect && commandOptions.driver) {
    const dialect = validateDialect(commandOptions.dialect);
    const driver = validateDriver(commandOptions.driver, dialect);
    const projectConfig = detectProjectConfig();

    options = {
      dialect,
      driver,
      dbPath: projectConfig.dbPath,
      createEnvFile: true,
      createDockerCompose: false,
      installDeps: commandOptions.install !== false,
      force: commandOptions.force,
      dryRun: commandOptions.dryRun,
    };
  } else if (commandOptions.dialect || commandOptions.driver) {
    // Partial non-interactive options provided
    throw new Error("Both --dialect and --driver must be provided for non-interactive mode.");
  } else {
    // Interactive mode
    const promptResult = await runInitPrompts();
    if (!promptResult) {
      return; // User cancelled
    }
    options = {
      ...promptResult,
      force: commandOptions.force,
      dryRun: commandOptions.dryRun,
    };
  }

  const filesCreated = await createFiles(options);

  if (options.dryRun) {
    log.info("\nDry run complete. No files were written.\n");
    return;
  }

  if (filesCreated.length === 0) {
    log.info("\nNo files were created. All files already exist.\n");
    return;
  }

  // Add helper scripts to package.json
  addScriptsToPackageJson();

  // Install dependencies if requested
  let depsInstalled = false;
  if (options.installDeps) {
    depsInstalled = await installDependencies(options);
  }

  showSummary(options, filesCreated, depsInstalled);
}

/**
 * Create all init files based on options.
 * Handles overwrite prompts and .env.example merging.
 *
 * @param options - Resolved init options
 * @returns Array of file paths that were created
 */
async function createFiles(options: InitOptions): Promise<string[]> {
  const cwd = process.cwd();
  const filesCreated: string[] = [];
  const existing = checkExistingFiles(options.dbPath);

  // 1. drizzle.config.ts
  const drizzleConfigPath = path.join(cwd, "drizzle.config.ts");
  if (await shouldWriteFile(drizzleConfigPath, existing.drizzleConfig, options)) {
    const content = generateDrizzleConfig(options);
    if (writeFile(drizzleConfigPath, content, { force: true, dryRun: options.dryRun })) {
      filesCreated.push("drizzle.config.ts");
    }
  }

  // 2. db/index.ts
  const dbIndexPath = path.join(cwd, options.dbPath, "index.ts");
  if (await shouldWriteFile(dbIndexPath, existing.dbIndex, options)) {
    const content = generateDbClient(options);
    if (writeFile(dbIndexPath, content, { force: true, dryRun: options.dryRun })) {
      filesCreated.push(`${options.dbPath}/index.ts`);
    }
  }

  // 3. db/schema.ts
  const schemaPath = path.join(cwd, options.dbPath, "schema.ts");
  if (await shouldWriteFile(schemaPath, existing.schema, options)) {
    const content = generateSchema(options.dialect);
    if (writeFile(schemaPath, content, { force: true, dryRun: options.dryRun })) {
      filesCreated.push(`${options.dbPath}/schema.ts`);
    }
  }

  // 4. .env.example (merge if exists)
  if (options.createEnvFile) {
    const envExamplePath = path.join(cwd, ".env.example");
    const newEnvContent = generateEnvExample(options);
    const config = getDriverConfig(options.driver);

    if (existing.envExample && !options.force) {
      // Check if variable already exists
      const existingContent = readFile(envExamplePath);
      if (!existingContent.includes(config.envVar)) {
        // Merge: append to existing
        const mergedContent = existingContent.trimEnd() + "\n\n" + newEnvContent;
        if (writeFile(envExamplePath, mergedContent, { force: true, dryRun: options.dryRun })) {
          filesCreated.push(".env.example (updated)");
        }
      } else {
        log.skip(envExamplePath);
      }
    } else if (await shouldWriteFile(envExamplePath, existing.envExample, options)) {
      if (writeFile(envExamplePath, newEnvContent, { force: true, dryRun: options.dryRun })) {
        filesCreated.push(".env.example");
      }
    }
  }

  // 5. docker-compose.yml (optional)
  if (options.createDockerCompose) {
    const dockerComposePath = path.join(cwd, "docker-compose.yml");
    if (await shouldWriteFile(dockerComposePath, existing.dockerCompose, options)) {
      const content = generateDockerCompose(options.dialect);
      if (content) {
        if (writeFile(dockerComposePath, content, { force: true, dryRun: options.dryRun })) {
          filesCreated.push("docker-compose.yml");
        }
      }
    }
  }

  return filesCreated;
}

/**
 * Determine if we should write a file.
 * - If file doesn't exist: yes
 * - If force flag: yes
 * - If dryRun: yes (will be handled by writeFile)
 * - Otherwise: prompt user
 */
async function shouldWriteFile(
  filePath: string,
  exists: boolean,
  options: InitOptions
): Promise<boolean> {
  if (!exists) {
    return true;
  }

  if (options.force || options.dryRun) {
    return true;
  }

  // Prompt user
  const result = await promptOverwrite(path.basename(filePath));
  if (result === null) {
    // User cancelled
    log.info("Aborted.");
    process.exit(0);
  }

  if (!result) {
    log.skip(filePath);
  }

  return result;
}
