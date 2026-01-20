import * as path from "path";
import { generateModel } from "./model";
import { generateActions } from "./actions";
import {
  parseFields,
  toPascalCase,
  writeFile,
  validateModelName,
  createModelContext,
  getAppPath,
  log,
  Field,
  GeneratorOptions,
  ModelContext,
} from "../lib";

export function generateScaffold(name: string, fieldArgs: string[], options: GeneratorOptions = {}): void {
  validateModelName(name);

  const ctx = createModelContext(name);
  const fields = parseFields(fieldArgs);
  const prefix = options.dryRun ? "[dry-run] " : "";

  log.info(`\n${prefix}Scaffolding ${ctx.pascalName}...\n`);

  generateModel(ctx.singularName, fieldArgs, options);
  generateActions(ctx.singularName, options);
  generatePages(ctx, fields, options);

  log.info(`\nNext steps:`);
  log.info(`  1. Run 'pnpm db:push' to update the database`);
  log.info(`  2. Run 'pnpm dev' and visit /${ctx.kebabPlural}`);
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

  // Show/Edit page
  writeFile(
    path.join(basePath, "[id]", "page.tsx"),
    generateShowPage(pascalName, pascalPlural, camelName, kebabPlural, fields, options),
    options
  );

  // Edit page
  writeFile(
    path.join(basePath, "[id]", "edit", "page.tsx"),
    generateEditPage(pascalName, camelName, kebabPlural, fields, options),
    options
  );
}

function generateIndexPage(
  pascalName: string,
  pascalPlural: string,
  camelName: string,
  kebabPlural: string,
  fields: Field[]
): string {
  const displayField = fields[0]?.name || "id";

  return `import Link from "next/link";
import { get${pascalPlural} } from "./actions";
import { delete${pascalName} } from "./actions";

export default async function ${pascalPlural}Page() {
  const ${camelName}s = await get${pascalPlural}();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">${pascalPlural}</h1>
        <Link
          href="/${kebabPlural}/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          New ${pascalName}
        </Link>
      </div>

      {${camelName}s.length === 0 ? (
        <p className="text-gray-500">No ${camelName}s yet.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {${camelName}s.map((${camelName}) => (
            <div
              key={${camelName}.id}
              className="flex items-center justify-between py-4"
            >
              <Link href={\`/${kebabPlural}/\${${camelName}.id}\`} className="font-medium text-gray-900 hover:text-gray-600">
                {${camelName}.${displayField}}
              </Link>
              <div className="flex gap-4 text-sm">
                <Link
                  href={\`/${kebabPlural}/\${${camelName}.id}/edit\`}
                  className="text-gray-500 hover:text-gray-900"
                >
                  Edit
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await delete${pascalName}(${camelName}.id);
                  }}
                >
                  <button type="submit" className="text-gray-500 hover:text-red-600">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`;
}

function generateNewPage(
  pascalName: string,
  camelName: string,
  kebabPlural: string,
  fields: Field[]
): string {
  return `import { redirect } from "next/navigation";
import Link from "next/link";
import { create${pascalName} } from "../actions";

export default function New${pascalName}Page() {
  async function handleCreate(formData: FormData) {
    "use server";
    await create${pascalName}({
${fields.map((f) => `      ${f.name}: ${formDataValue(f)},`).join("\n")}
    });
    redirect("/${kebabPlural}");
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">New ${pascalName}</h1>

      <form action={handleCreate} className="space-y-5">
${fields.map((f) => generateFormField(f, camelName)).join("\n\n")}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Create ${pascalName}
          </button>
          <Link
            href="/${kebabPlural}"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
`;
}

function generateShowPage(
  pascalName: string,
  _pascalPlural: string,
  camelName: string,
  kebabPlural: string,
  fields: Field[],
  options: GeneratorOptions = {}
): string {
  const idHandling = options.uuid
    ? `const ${camelName} = await get${pascalName}(id);`
    : `const numericId = Number(id);
  if (isNaN(numericId)) {
    notFound();
  }
  const ${camelName} = await get${pascalName}(numericId);`;

  return `import { notFound } from "next/navigation";
import Link from "next/link";
import { get${pascalName} } from "../actions";

export default async function ${pascalName}Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  ${idHandling}

  if (!${camelName}) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">${pascalName}</h1>
        <div className="flex gap-3">
          <Link
            href={\`/${kebabPlural}/\${${camelName}.id}/edit\`}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Edit
          </Link>
          <Link
            href="/${kebabPlural}"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Back
          </Link>
        </div>
      </div>

      <dl className="divide-y divide-gray-100">
${fields
  .map(
    (f) => `        <div className="py-3">
          <dt className="text-sm text-gray-500">${toPascalCase(f.name)}</dt>
          <dd className="mt-1 text-gray-900">{${camelName}.${f.name}}</dd>
        </div>`
  )
  .join("\n")}
        <div className="py-3">
          <dt className="text-sm text-gray-500">Created At</dt>
          <dd className="mt-1 text-gray-900">{${camelName}.createdAt.toLocaleString()}</dd>
        </div>
      </dl>
    </div>
  );
}
`;
}

function generateEditPage(
  pascalName: string,
  camelName: string,
  kebabPlural: string,
  fields: Field[],
  options: GeneratorOptions = {}
): string {
  const idHandling = options.uuid
    ? `const ${camelName} = await get${pascalName}(id);`
    : `const numericId = Number(id);
  if (isNaN(numericId)) {
    notFound();
  }
  const ${camelName} = await get${pascalName}(numericId);`;

  const updateId = options.uuid ? "id" : "numericId";

  return `import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { get${pascalName}, update${pascalName} } from "../../actions";

export default async function Edit${pascalName}Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  ${idHandling}

  if (!${camelName}) {
    notFound();
  }

  async function handleUpdate(formData: FormData) {
    "use server";
    await update${pascalName}(${updateId}, {
${fields.map((f) => `      ${f.name}: ${formDataValue(f)},`).join("\n")}
    });
    redirect("/${kebabPlural}");
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">Edit ${pascalName}</h1>

      <form action={handleUpdate} className="space-y-5">
${fields.map((f) => generateFormField(f, camelName, true)).join("\n\n")}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Update ${pascalName}
          </button>
          <Link
            href="/${kebabPlural}"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
`;
}

function generateFormField(field: Field, camelName: string, withDefault = false): string {
  const label = toPascalCase(field.name);
  const defaultValue = withDefault ? ` defaultValue={${camelName}.${field.name}}` : "";
  const inputClasses = "mt-1.5 block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0";
  const selectClasses = "mt-1.5 block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-0";
  const optionalLabel = field.nullable ? ` <span className="text-gray-400">(optional)</span>` : "";
  const required = field.nullable ? "" : " required";

  // Text/Long text - textarea
  if (field.type === "text" || field.type === "json") {
    const rows = field.type === "json" ? 6 : 4;
    const placeholder = field.type === "json" ? ` placeholder="{}"` : "";
    return `        <div>
          <label htmlFor="${field.name}" className="block text-sm font-medium text-gray-700">
            ${label}${optionalLabel}
          </label>
          <textarea
            id="${field.name}"
            name="${field.name}"
            rows={${rows}}
            className="${inputClasses} resize-none"${defaultValue}${placeholder}${required}
          />
        </div>`;
  }

  // Boolean - checkbox
  if (field.type === "boolean" || field.type === "bool") {
    const defaultChecked = withDefault ? ` defaultChecked={${camelName}.${field.name}}` : "";
    return `        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="${field.name}"
            name="${field.name}"
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-0 focus:ring-offset-0"${defaultChecked}
          />
          <label htmlFor="${field.name}" className="text-sm font-medium text-gray-700">
            ${label}
          </label>
        </div>`;
  }

  // Integer/BigInt - number input
  if (field.type === "integer" || field.type === "int" || field.type === "bigint") {
    return `        <div>
          <label htmlFor="${field.name}" className="block text-sm font-medium text-gray-700">
            ${label}${optionalLabel}
          </label>
          <input
            type="number"
            id="${field.name}"
            name="${field.name}"
            className="${inputClasses}"${defaultValue}${required}
          />
        </div>`;
  }

  // Float/Decimal - number input with step
  if (field.type === "float" || field.type === "decimal") {
    const step = field.type === "decimal" ? "0.01" : "any";
    return `        <div>
          <label htmlFor="${field.name}" className="block text-sm font-medium text-gray-700">
            ${label}${optionalLabel}
          </label>
          <input
            type="number"
            step="${step}"
            id="${field.name}"
            name="${field.name}"
            className="${inputClasses}"${defaultValue}${required}
          />
        </div>`;
  }

  // Date/Datetime - date input
  if (field.type === "date") {
    const dateDefault = withDefault ? ` defaultValue={${camelName}.${field.name}?.toISOString().split("T")[0]}` : "";
    return `        <div>
          <label htmlFor="${field.name}" className="block text-sm font-medium text-gray-700">
            ${label}${optionalLabel}
          </label>
          <input
            type="date"
            id="${field.name}"
            name="${field.name}"
            className="${inputClasses}"${dateDefault}${required}
          />
        </div>`;
  }

  if (field.type === "datetime" || field.type === "timestamp") {
    const dateDefault = withDefault ? ` defaultValue={${camelName}.${field.name}?.toISOString().slice(0, 16)}` : "";
    return `        <div>
          <label htmlFor="${field.name}" className="block text-sm font-medium text-gray-700">
            ${label}${optionalLabel}
          </label>
          <input
            type="datetime-local"
            id="${field.name}"
            name="${field.name}"
            className="${inputClasses}"${dateDefault}${required}
          />
        </div>`;
  }

  // Enum - select dropdown
  if (field.isEnum && field.enumValues) {
    const options = field.enumValues
      .map((v) => `            <option value="${v}">${toPascalCase(v)}</option>`)
      .join("\n");
    return `        <div>
          <label htmlFor="${field.name}" className="block text-sm font-medium text-gray-700">
            ${label}${optionalLabel}
          </label>
          <select
            id="${field.name}"
            name="${field.name}"
            className="${selectClasses}"${defaultValue}${required}
          >
${options}
          </select>
        </div>`;
  }

  // Default - text input (string, uuid, etc.)
  return `        <div>
          <label htmlFor="${field.name}" className="block text-sm font-medium text-gray-700">
            ${label}${optionalLabel}
          </label>
          <input
            type="text"
            id="${field.name}"
            name="${field.name}"
            className="${inputClasses}"${defaultValue}${required}
          />
        </div>`;
}

function formDataValue(field: Field): string {
  const getValue = `formData.get("${field.name}")`;
  const asString = `${getValue} as string`;

  // Handle nullable fields
  if (field.nullable) {
    if (field.type === "integer" || field.type === "int" || field.type === "bigint") {
      return `${getValue} ? parseInt(${asString}) : null`;
    }
    if (field.type === "float") {
      return `${getValue} ? parseFloat(${asString}) : null`;
    }
    if (field.type === "decimal") {
      return `${getValue} ? ${asString} : null`;
    }
    if (field.type === "datetime" || field.type === "timestamp" || field.type === "date") {
      return `${getValue} ? new Date(${asString}) : null`;
    }
    if (field.type === "json") {
      return `${getValue} ? JSON.parse(${asString}) : null`;
    }
    return `${getValue} ? ${asString} : null`;
  }

  // Required fields
  if (field.type === "boolean" || field.type === "bool") {
    return `${getValue} === "on"`;
  }
  if (field.type === "integer" || field.type === "int" || field.type === "bigint") {
    return `parseInt(${asString})`;
  }
  if (field.type === "float") {
    return `parseFloat(${asString})`;
  }
  if (field.type === "datetime" || field.type === "timestamp" || field.type === "date") {
    return `new Date(${asString})`;
  }
  if (field.type === "json") {
    return `JSON.parse(${asString})`;
  }
  return asString;
}
