import * as fs from "fs";
import * as path from "path";
import type { GeneratorOptions } from "./types";
import { log } from "./logger";
import { getDbPath } from "./config";

export function writeFile(filePath: string, content: string, options: GeneratorOptions = {}): boolean {
  const exists = fs.existsSync(filePath);

  if (exists && !options.force) {
    log.skip(filePath);
    return false;
  }

  if (options.dryRun) {
    if (exists && options.force) {
      log.wouldForce(filePath);
    } else {
      log.wouldCreate(filePath);
    }
    return true;
  }

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, content);

  if (exists && options.force) {
    log.force(filePath);
  } else {
    log.create(filePath);
  }

  return true;
}

export function deleteDirectory(dirPath: string, options: GeneratorOptions = {}): boolean {
  if (!fs.existsSync(dirPath)) {
    log.notFound(dirPath);
    return false;
  }

  if (options.dryRun) {
    log.wouldRemove(dirPath);
    return true;
  }

  fs.rmSync(dirPath, { recursive: true });
  log.remove(dirPath);
  return true;
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

export function modelExistsInSchema(tableName: string): boolean {
  const schemaPath = path.join(getDbPath(), "schema.ts");

  if (!fs.existsSync(schemaPath)) {
    return false;
  }

  const content = fs.readFileSync(schemaPath, "utf-8");
  // Check for table definition with any dialect: sqliteTable, pgTable, or mysqlTable
  const pattern = new RegExp(
    `(?:sqliteTable|pgTable|mysqlTable)\\s*\\(\\s*["']${tableName}["']`
  );
  return pattern.test(content);
}
