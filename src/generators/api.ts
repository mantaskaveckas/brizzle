import * as path from "path";
import { generateModel } from "./model";
import {
  writeFile,
  validateModelName,
  createModelContext,
  getAppPath,
  getDbImport,
  getSchemaImport,
  getRunCommand,
  log,
  GeneratorOptions,
} from "../lib";

/**
 * Generates REST API route handlers for a model.
 *
 * Creates the schema model and Next.js API routes with GET, POST, PATCH, and DELETE handlers.
 * The routes follow REST conventions: /api/[resource] for collection and /api/[resource]/[id] for member.
 *
 * @param name - Model name (singular, e.g., "product")
 * @param fieldArgs - Array of field definitions (e.g., ["name:string", "price:float"])
 * @param options - Generation options (force, dryRun, uuid, noTimestamps)
 * @throws {Error} If model name is invalid or reserved
 * @example
 * generateApi("product", ["name:string", "price:float"], { uuid: true });
 */
export function generateApi(
  name: string,
  fieldArgs: string[],
  options: GeneratorOptions = {}
): void {
  validateModelName(name);

  const ctx = createModelContext(name);
  const prefix = options.dryRun ? "[dry-run] " : "";

  log.info(`\n${prefix}Generating API ${ctx.pascalName}...\n`);

  generateModel(ctx.singularName, fieldArgs, options);
  generateRoutes(ctx.camelPlural, ctx.kebabPlural, options);

  const run = getRunCommand();
  log.info(`\nNext steps:`);
  log.info(`  1. Run '${run} db:push' to update the database`);
  log.info(`  2. API available at /api/${ctx.kebabPlural}`);
}

function generateRoutes(camelPlural: string, kebabPlural: string, options: GeneratorOptions): void {
  const basePath = path.join(getAppPath(), "api", kebabPlural);

  writeFile(
    path.join(basePath, "route.ts"),
    generateCollectionRoute(camelPlural, kebabPlural),
    options
  );

  writeFile(
    path.join(basePath, "[id]", "route.ts"),
    generateMemberRoute(camelPlural, kebabPlural, options),
    options
  );
}

function generateCollectionRoute(camelPlural: string, kebabPlural: string): string {
  const dbImport = getDbImport();
  const schemaImport = getSchemaImport();

  return `import { db } from "${dbImport}";
import { ${camelPlural} } from "${schemaImport}";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await db
      .select()
      .from(${camelPlural})
      .orderBy(desc(${camelPlural}.createdAt));

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/${kebabPlural} failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await db.insert(${camelPlural}).values(body).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/${kebabPlural} failed:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create record" },
      { status: 500 }
    );
  }
}
`;
}

function generateMemberRoute(
  camelPlural: string,
  kebabPlural: string,
  options: GeneratorOptions = {}
): string {
  const dbImport = getDbImport();
  const schemaImport = getSchemaImport();

  const idValidation = options.uuid
    ? ""
    : `
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }`;

  const idValue = options.uuid ? "id" : "numericId";

  return `import { db } from "${dbImport}";
import { ${camelPlural} } from "${schemaImport}";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;${idValidation}
    const result = await db
      .select()
      .from(${camelPlural})
      .where(eq(${camelPlural}.id, ${idValue}))
      .limit(1);

    if (!result[0]) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("GET /api/${kebabPlural}/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch record" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;${idValidation}
    const body = await request.json();
    const result = await db
      .update(${camelPlural})
      .set({ ...body, updatedAt: new Date() })
      .where(eq(${camelPlural}.id, ${idValue}))
      .returning();

    if (!result[0]) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PATCH /api/${kebabPlural}/[id] failed:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update record" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;${idValidation}
    await db.delete(${camelPlural}).where(eq(${camelPlural}.id, ${idValue}));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/${kebabPlural}/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to delete record" },
      { status: 500 }
    );
  }
}
`;
}
