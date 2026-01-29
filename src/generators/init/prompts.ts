/**
 * Interactive prompts and utilities for brizzle init.
 * Uses @clack/prompts for a beautiful CLI experience.
 * @module init/prompts
 */

import {
  intro,
  outro,
  select,
  confirm,
  note,
  cancel,
  isCancel,
  log as clackLog,
  text,
  spinner,
} from "@clack/prompts";
import * as path from "path";
import * as fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
import type { Dialect } from "../../lib/types";
import type { Driver, InitOptions } from "./types";
import { getDriversForDialect, DRIVERS } from "./drivers";
import { detectProjectConfig, fileExists, detectPackageManager, getRunCommand } from "../../lib";

/**
 * Check if this appears to be a Next.js project.
 * Looks for next.config.* files or next in package.json dependencies.
 *
 * @returns True if Next.js indicators are found
 */
function checkNextJsProject(): boolean {
  const cwd = process.cwd();
  const hasNextConfig =
    fs.existsSync(path.join(cwd, "next.config.js")) ||
    fs.existsSync(path.join(cwd, "next.config.mjs")) ||
    fs.existsSync(path.join(cwd, "next.config.ts"));

  const packageJsonPath = path.join(cwd, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    try {
      const content = fs.readFileSync(packageJsonPath, "utf-8");
      const pkg = JSON.parse(content);
      const hasNextDep = pkg.dependencies?.next || pkg.devDependencies?.next;
      return hasNextConfig || !!hasNextDep;
    } catch {
      return hasNextConfig;
    }
  }

  return hasNextConfig;
}

/**
 * Check which init-related files already exist.
 * Used to determine which files need overwrite confirmation.
 *
 * @param dbPath - Database directory path (e.g., "db" or "src/db")
 * @returns Object with boolean flags for each file type
 */
export function checkExistingFiles(dbPath: string): {
  drizzleConfig: boolean;
  dbIndex: boolean;
  schema: boolean;
  envExample: boolean;
  dockerCompose: boolean;
} {
  const cwd = process.cwd();
  return {
    drizzleConfig: fileExists(path.join(cwd, "drizzle.config.ts")),
    dbIndex: fileExists(path.join(cwd, dbPath, "index.ts")),
    schema: fileExists(path.join(cwd, dbPath, "schema.ts")),
    envExample: fileExists(path.join(cwd, ".env.example")),
    dockerCompose: fileExists(path.join(cwd, "docker-compose.yml")),
  };
}

/**
 * Run the interactive init prompts to collect configuration.
 * Guides user through dialect, driver, and file options selection.
 *
 * @returns Resolved InitOptions, or null if user cancels
 */
export async function runInitPrompts(): Promise<InitOptions | null> {
  intro("Welcome to Brizzle - Drizzle ORM Setup Wizard");

  // Warn if not a Next.js project
  if (!checkNextJsProject()) {
    clackLog.warn("This doesn't appear to be a Next.js project. Brizzle is optimized for Next.js.");
    const proceed = await confirm({
      message: "Continue anyway?",
      initialValue: true,
    });

    if (isCancel(proceed) || !proceed) {
      cancel("Setup cancelled.");
      return null;
    }
  }

  const projectConfig = detectProjectConfig();
  const defaultDbPath = projectConfig.dbPath;

  // Select dialect
  const dialectResult = await select({
    message: "Select your database dialect:",
    options: [
      { value: "sqlite" as const, label: "SQLite", hint: "Lightweight, file-based database" },
      { value: "postgresql" as const, label: "PostgreSQL", hint: "Advanced, robust database" },
      { value: "mysql" as const, label: "MySQL", hint: "Popular, widely-supported database" },
    ],
  });

  if (isCancel(dialectResult)) {
    cancel("Setup cancelled.");
    return null;
  }

  const dialect = dialectResult as Dialect;

  // Select driver
  const driverOptions = getDriversForDialect(dialect).map((d) => ({
    value: d.driver,
    label: d.name,
    hint: d.hint,
  }));

  const driverResult = await select({
    message: "Select your database driver:",
    options: driverOptions,
  });

  if (isCancel(driverResult)) {
    cancel("Setup cancelled.");
    return null;
  }

  const driver = driverResult as Driver;

  // Confirm db path
  const dbPath = await text({
    message: "Where should database files be located?",
    placeholder: defaultDbPath,
    defaultValue: defaultDbPath,
    validate: (value) => {
      if (!value) return "Path is required";
      if (value.includes("..")) return "Path cannot contain '..'";
      return undefined;
    },
  });

  if (isCancel(dbPath)) {
    cancel("Setup cancelled.");
    return null;
  }

  // Create .env.example?
  const createEnvFile = await confirm({
    message: "Create/update .env.example with database connection template?",
    initialValue: true,
  });

  if (isCancel(createEnvFile)) {
    cancel("Setup cancelled.");
    return null;
  }

  // Docker compose for PostgreSQL/MySQL?
  let createDockerCompose = false;
  if (dialect !== "sqlite") {
    const dockerResult = await confirm({
      message: "Generate docker-compose.yml for local database?",
      initialValue: false,
    });

    if (isCancel(dockerResult)) {
      cancel("Setup cancelled.");
      return null;
    }
    createDockerCompose = dockerResult;
  }

  // Install dependencies?
  const installDeps = await confirm({
    message: "Install dependencies now?",
    initialValue: true,
  });

  if (isCancel(installDeps)) {
    cancel("Setup cancelled.");
    return null;
  }

  return {
    dialect,
    driver,
    dbPath,
    createEnvFile,
    createDockerCompose,
    installDeps,
  };
}

/**
 * Prompt the user to confirm overwriting an existing file.
 *
 * @param filePath - Path to the file that would be overwritten
 * @returns True to overwrite, false to skip, null if user cancels entirely
 */
export async function promptOverwrite(filePath: string): Promise<boolean | null> {
  const result = await confirm({
    message: `${filePath} already exists. Overwrite?`,
    initialValue: false,
  });

  if (isCancel(result)) {
    return null;
  }

  return result;
}

/**
 * Install required dependencies using the detected package manager.
 * Installs both runtime (drizzle-orm, driver) and dev (drizzle-kit) packages.
 * Shows a spinner during installation.
 *
 * @param options - Init options containing the selected driver
 * @returns True if installation succeeded, false on failure
 */
export async function installDependencies(options: InitOptions): Promise<boolean> {
  const driverConfig = DRIVERS[options.driver];
  const pm = detectPackageManager();

  // Build package lists
  const packages: string[] = [];
  if (driverConfig.package) {
    packages.push(driverConfig.package);
  }
  packages.push("drizzle-orm");

  const devPackages = ["drizzle-kit"];

  // Build install commands
  const installCmd = pm === "npm" ? "npm install" : `${pm} add`;
  const devFlag = pm === "npm" ? "--save-dev" : "-D";

  const s = spinner();

  try {
    // Install runtime dependencies
    s.start(`Installing ${packages.join(", ")}...`);
    await execAsync(`${installCmd} ${packages.join(" ")}`, {
      cwd: process.cwd(),
    });
    s.stop(`Installed ${packages.join(", ")}`);

    // Install dev dependencies
    s.start(`Installing ${devPackages.join(", ")} (dev)...`);
    await execAsync(`${installCmd} ${devFlag} ${devPackages.join(" ")}`, {
      cwd: process.cwd(),
    });
    s.stop(`Installed ${devPackages.join(", ")}`);

    return true;
  } catch {
    s.stop("Installation failed");
    clackLog.error(
      `Failed to install dependencies. Please run manually:\n  ${installCmd} ${packages.join(" ")}\n  ${installCmd} ${devFlag} ${devPackages.join(" ")}`
    );
    return false;
  }
}

/**
 * Add Drizzle helper scripts to package.json.
 * Adds db:generate, db:migrate, db:push, and db:studio scripts.
 * Existing scripts with the same names are not overwritten.
 *
 * @returns True if scripts were added successfully
 */
export function addScriptsToPackageJson(): boolean {
  const cwd = process.cwd();
  const packageJsonPath = path.join(cwd, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    clackLog.warn("package.json not found, skipping script addition");
    return false;
  }

  try {
    const content = fs.readFileSync(packageJsonPath, "utf-8");
    const pkg = JSON.parse(content);

    // Initialize scripts object if it doesn't exist
    if (!pkg.scripts) {
      pkg.scripts = {};
    }

    // Add drizzle scripts (don't overwrite existing)
    const scriptsToAdd: Record<string, string> = {
      "db:generate": "drizzle-kit generate",
      "db:migrate": "drizzle-kit migrate",
      "db:push": "drizzle-kit push",
      "db:studio": "drizzle-kit studio",
    };

    let scriptsAdded = 0;
    for (const [name, command] of Object.entries(scriptsToAdd)) {
      if (!pkg.scripts[name]) {
        pkg.scripts[name] = command;
        scriptsAdded++;
      }
    }

    if (scriptsAdded > 0) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + "\n");
      clackLog.info(`Added ${scriptsAdded} script(s) to package.json`);
    }

    return true;
  } catch {
    clackLog.warn("Failed to add scripts to package.json");
    return false;
  }
}

/**
 * Display a summary after init completes.
 * Shows files created, install commands (if deps not installed), and next steps.
 *
 * @param options - The init options that were used
 * @param filesCreated - List of files that were created
 * @param depsInstalled - Whether dependencies were auto-installed
 */
export function showSummary(
  options: InitOptions,
  filesCreated: string[],
  depsInstalled: boolean
): void {
  const driverConfig = DRIVERS[options.driver];

  // Files created
  if (filesCreated.length > 0) {
    note(filesCreated.map((f) => `  ${f}`).join("\n"), "Files created");
  }

  // Show install command only if deps weren't installed
  if (!depsInstalled) {
    const packages: string[] = [];
    if (driverConfig.package) {
      packages.push(driverConfig.package);
    }
    packages.push("drizzle-orm");

    const pm = detectPackageManager();
    const installCmd = pm === "npm" ? "npm install" : `${pm} add`;
    const devFlag = pm === "npm" ? "--save-dev" : "-D";

    note(
      `${installCmd} ${packages.join(" ")}\n` + `${installCmd} ${devFlag} drizzle-kit`,
      "Install dependencies"
    );
  }

  // Next steps
  const nextSteps: string[] = [];
  let step = 1;

  if (options.createDockerCompose) {
    nextSteps.push(`${step}. Start your database: docker compose up -d`);
    step++;
  }

  if (options.createEnvFile) {
    nextSteps.push(`${step}. Copy environment file: cp .env.example .env`);
    step++;
  }

  nextSteps.push(`${step}. Set ${driverConfig.envVar} in your .env file`);
  step++;

  const run = getRunCommand();

  nextSteps.push(`${step}. Scaffold your first CRUD:`);
  nextSteps.push(`   npx brizzle scaffold post title:string body:text`);
  step++;

  nextSteps.push(`${step}. Generate and run migrations:`);
  nextSteps.push(`   ${run} db:generate`);
  nextSteps.push(`   ${run} db:migrate`);

  note(nextSteps.join("\n"), "Next steps");

  outro("Happy coding with Drizzle ORM!");
}
