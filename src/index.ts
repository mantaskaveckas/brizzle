import { program } from "commander";
import { createRequire } from "module";
import { generateModel } from "./generators/model";
import { generateActions } from "./generators/actions";
import { generateScaffold } from "./generators/scaffold";
import { generateResource } from "./generators/resource";
import { generateApi } from "./generators/api";
import { destroyScaffold, destroyResource, destroyApi } from "./generators/destroy";
import { log, detectProjectConfig, detectDialect } from "./lib";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

function handleError(error: unknown): void {
  if (error instanceof Error) {
    log.error(error.message);
  } else {
    log.error(String(error));
  }
  process.exit(1);
}

program
  .name("drizzle-gen")
  .description("Rails-like generators for Next.js + Drizzle")
  .version(version);

// ============================================================================
// Generate commands
// ============================================================================

interface CommandOptions {
  force?: boolean;
  dryRun?: boolean;
  uuid?: boolean;
  timestamps?: boolean; // --no-timestamps sets this to false
}

program
  .command("model <name> [fields...]")
  .description(
    `Generate a Drizzle schema model

  Examples:
    drizzle-gen model user name:string email:string:unique
    drizzle-gen model post title:string body:text published:boolean
    drizzle-gen model order total:decimal status:enum:pending,paid,shipped
    drizzle-gen model token value:uuid --uuid --no-timestamps
    drizzle-gen model comment content:text? author:string`
  )
  .option("-f, --force", "Overwrite existing files")
  .option("-n, --dry-run", "Preview changes without writing files")
  .option("-u, --uuid", "Use UUID for primary key instead of auto-increment")
  .option("--no-timestamps", "Skip createdAt/updatedAt fields")
  .action((name: string, fields: string[], opts: CommandOptions) => {
    try {
      generateModel(name, fields, {
        ...opts,
        noTimestamps: opts.timestamps === false,
      });
    } catch (error) {
      handleError(error);
    }
  });

program
  .command("actions <name>")
  .description(
    `Generate server actions for an existing model

  Examples:
    drizzle-gen actions user
    drizzle-gen actions post --force`
  )
  .option("-f, --force", "Overwrite existing files")
  .option("-n, --dry-run", "Preview changes without writing files")
  .action((name: string, opts: CommandOptions) => {
    try {
      generateActions(name, opts);
    } catch (error) {
      handleError(error);
    }
  });

program
  .command("resource <name> [fields...]")
  .description(
    `Generate model and actions (no views)

  Examples:
    drizzle-gen resource user name:string email:string:unique
    drizzle-gen resource session token:uuid userId:references:user --uuid`
  )
  .option("-f, --force", "Overwrite existing files")
  .option("-n, --dry-run", "Preview changes without writing files")
  .option("-u, --uuid", "Use UUID for primary key instead of auto-increment")
  .option("--no-timestamps", "Skip createdAt/updatedAt fields")
  .action((name: string, fields: string[], opts: CommandOptions) => {
    try {
      generateResource(name, fields, {
        ...opts,
        noTimestamps: opts.timestamps === false,
      });
    } catch (error) {
      handleError(error);
    }
  });

program
  .command("scaffold <name> [fields...]")
  .description(
    `Generate model, actions, and pages (full CRUD)

  Examples:
    drizzle-gen scaffold post title:string body:text published:boolean
    drizzle-gen scaffold product name:string price:float description:text?
    drizzle-gen scaffold order status:enum:pending,processing,shipped,delivered`
  )
  .option("-f, --force", "Overwrite existing files")
  .option("-n, --dry-run", "Preview changes without writing files")
  .option("-u, --uuid", "Use UUID for primary key instead of auto-increment")
  .option("--no-timestamps", "Skip createdAt/updatedAt fields")
  .action((name: string, fields: string[], opts: CommandOptions) => {
    try {
      generateScaffold(name, fields, {
        ...opts,
        noTimestamps: opts.timestamps === false,
      });
    } catch (error) {
      handleError(error);
    }
  });

program
  .command("api <name> [fields...]")
  .description(
    `Generate model and API route handlers (REST)

  Examples:
    drizzle-gen api product name:string price:float
    drizzle-gen api webhook url:string secret:string:unique --uuid`
  )
  .option("-f, --force", "Overwrite existing files")
  .option("-n, --dry-run", "Preview changes without writing files")
  .option("-u, --uuid", "Use UUID for primary key instead of auto-increment")
  .option("--no-timestamps", "Skip createdAt/updatedAt fields")
  .action((name: string, fields: string[], opts: CommandOptions) => {
    try {
      generateApi(name, fields, {
        ...opts,
        noTimestamps: opts.timestamps === false,
      });
    } catch (error) {
      handleError(error);
    }
  });

// ============================================================================
// Destroy commands
// ============================================================================

program
  .command("destroy <type> <name>")
  .alias("d")
  .description(
    `Remove generated files (scaffold, resource, api)

  Examples:
    drizzle-gen destroy scaffold post
    drizzle-gen d api product --dry-run`
  )
  .option("-n, --dry-run", "Preview changes without deleting files")
  .action((type: string, name: string, opts: CommandOptions) => {
    try {
      switch (type) {
        case "scaffold":
          destroyScaffold(name, opts);
          break;
        case "resource":
          destroyResource(name, opts);
          break;
        case "api":
          destroyApi(name, opts);
          break;
        default:
          throw new Error(`Unknown type "${type}". Use: scaffold, resource, or api`);
      }
    } catch (error) {
      handleError(error);
    }
  });

// ============================================================================
// Config command
// ============================================================================

program
  .command("config")
  .description("Show detected project configuration")
  .action(() => {
    const config = detectProjectConfig();
    const dialect = detectDialect();

    console.log("\nDetected project configuration:\n");
    console.log(`  Project structure:  ${config.useSrc ? "src/ (e.g., src/app/, src/db/)" : "root (e.g., app/, db/)"}`);
    console.log(`  Path alias:         ${config.alias}/`);
    console.log(`  App directory:      ${config.appPath}/`);
    console.log(`  DB directory:       ${config.dbPath}/`);
    console.log(`  Database dialect:   ${dialect}`);
    console.log();
    console.log("Imports will use:");
    console.log(`  DB:     ${config.alias}/${config.dbPath.replace(/^src\//, "")}`);
    console.log(`  Schema: ${config.alias}/${config.dbPath.replace(/^src\//, "")}/schema`);
    console.log();
  });

program.parse();
