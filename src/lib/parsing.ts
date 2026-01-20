import type { Field } from "./types";
import { validateFieldDefinition } from "./validation";

export function parseFields(fields: string[]): Field[] {
  return fields.map((field) => {
    validateFieldDefinition(field);

    const parts = field.split(":");
    let name = parts[0];
    let type = parts[1] || "string";

    // Check for nullable modifier (?)
    const nullable = name.endsWith("?") || type.endsWith("?");
    if (name.endsWith("?")) {
      name = name.slice(0, -1);
    }
    if (type.endsWith("?")) {
      type = type.slice(0, -1);
    }

    // Check for unique modifier
    const unique = parts.includes("unique");

    if (type === "references") {
      return {
        name,
        type: "integer",
        isReference: true,
        referenceTo: parts[2],
        isEnum: false,
        nullable,
        unique,
      };
    }

    if (type === "enum") {
      const enumValues = parts[2]?.split(",") || [];
      return {
        name,
        type: "enum",
        isReference: false,
        isEnum: true,
        enumValues,
        nullable,
        unique,
      };
    }

    return { name, type, isReference: false, isEnum: false, nullable, unique };
  });
}
