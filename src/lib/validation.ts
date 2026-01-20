import { VALID_FIELD_TYPES } from "./types";

export function validateModelName(name: string): void {
  if (!name) {
    throw new Error("Model name is required");
  }
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(name)) {
    throw new Error(
      `Invalid model name "${name}". Must start with a letter and contain only letters and numbers.`
    );
  }
  const reserved = ["model", "schema", "db", "database", "table"];
  if (reserved.includes(name.toLowerCase())) {
    throw new Error(`"${name}" is a reserved word and cannot be used as a model name.`);
  }
}

export function validateFieldDefinition(fieldDef: string): void {
  const parts = fieldDef.split(":");
  let name = parts[0];
  let type = parts[1] || "string";

  // Strip nullable modifier for validation
  if (name.endsWith("?")) {
    name = name.slice(0, -1);
  }
  if (type.endsWith("?")) {
    type = type.slice(0, -1);
  }

  if (!name) {
    throw new Error(`Invalid field definition "${fieldDef}". Field name is required.`);
  }
  if (!/^[a-z][a-zA-Z0-9]*$/.test(name)) {
    throw new Error(
      `Invalid field name "${name}". Must be camelCase (start with lowercase letter).`
    );
  }
  if (type && !type.startsWith("references") && type !== "enum" && type !== "unique") {
    if (!VALID_FIELD_TYPES.includes(type as (typeof VALID_FIELD_TYPES)[number])) {
      throw new Error(
        `Invalid field type "${type}". Valid types: ${VALID_FIELD_TYPES.join(", ")}, enum`
      );
    }
  }
  // Validate enum has values
  if (type === "enum") {
    const enumValues = parts[2];
    if (!enumValues || enumValues === "unique") {
      throw new Error(
        `Enum field "${name}" requires values. Example: ${name}:enum:draft,published,archived`
      );
    }
  }
}
