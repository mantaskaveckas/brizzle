import type { ModelContext } from "./types";

export function toPascalCase(str: string): string {
  return str
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");
}

export function toKebabCase(str: string): string {
  return toSnakeCase(str).replace(/_/g, "-");
}

export function pluralize(str: string): string {
  if (str.endsWith("y") && !/[aeiou]y$/.test(str)) {
    return str.slice(0, -1) + "ies";
  }
  if (str.endsWith("s") || str.endsWith("x") || str.endsWith("ch") || str.endsWith("sh")) {
    return str + "es";
  }
  return str + "s";
}

export function singularize(str: string): string {
  if (str.endsWith("ies")) {
    return str.slice(0, -3) + "y";
  }
  if (str.endsWith("es") && (str.endsWith("xes") || str.endsWith("ches") || str.endsWith("shes") || str.endsWith("sses"))) {
    return str.slice(0, -2);
  }
  if (str.endsWith("s") && !str.endsWith("ss")) {
    return str.slice(0, -1);
  }
  return str;
}

export function createModelContext(name: string): ModelContext {
  const singularName = singularize(name);
  const pluralName = pluralize(singularName);

  return {
    name,
    singularName,
    pluralName,
    pascalName: toPascalCase(singularName),
    pascalPlural: toPascalCase(pluralName),
    camelName: toCamelCase(singularName),
    camelPlural: toCamelCase(pluralName),
    snakeName: toSnakeCase(singularName),
    snakePlural: toSnakeCase(pluralName),
    kebabName: toKebabCase(singularName),
    kebabPlural: toKebabCase(pluralName),
    tableName: pluralize(toSnakeCase(singularName)),
  };
}
