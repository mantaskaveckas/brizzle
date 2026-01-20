import { describe, it, expect } from "vitest";
import {
  toPascalCase,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  pluralize,
  singularize,
  createModelContext,
} from "..";

// ============================================================================
// String Transformations
// ============================================================================

describe("toPascalCase", () => {
  it("converts simple words", () => {
    expect(toPascalCase("user")).toBe("User");
    expect(toPascalCase("post")).toBe("Post");
  });

  it("converts camelCase", () => {
    expect(toPascalCase("userName")).toBe("UserName");
    expect(toPascalCase("blogPost")).toBe("BlogPost");
  });

  it("converts snake_case", () => {
    expect(toPascalCase("user_name")).toBe("UserName");
    expect(toPascalCase("blog_post")).toBe("BlogPost");
  });

  it("converts kebab-case", () => {
    expect(toPascalCase("user-name")).toBe("UserName");
    expect(toPascalCase("blog-post")).toBe("BlogPost");
  });
});

describe("toCamelCase", () => {
  it("converts simple words", () => {
    expect(toCamelCase("User")).toBe("user");
    expect(toCamelCase("Post")).toBe("post");
  });

  it("converts PascalCase", () => {
    expect(toCamelCase("UserName")).toBe("userName");
    expect(toCamelCase("BlogPost")).toBe("blogPost");
  });

  it("converts snake_case", () => {
    expect(toCamelCase("user_name")).toBe("userName");
    expect(toCamelCase("blog_post")).toBe("blogPost");
  });
});

describe("toSnakeCase", () => {
  it("converts simple words", () => {
    expect(toSnakeCase("user")).toBe("user");
    expect(toSnakeCase("User")).toBe("user");
  });

  it("converts camelCase", () => {
    expect(toSnakeCase("userName")).toBe("user_name");
    expect(toSnakeCase("blogPost")).toBe("blog_post");
  });

  it("converts PascalCase", () => {
    expect(toSnakeCase("UserName")).toBe("user_name");
    expect(toSnakeCase("BlogPost")).toBe("blog_post");
  });
});

describe("toKebabCase", () => {
  it("converts simple words", () => {
    expect(toKebabCase("user")).toBe("user");
    expect(toKebabCase("User")).toBe("user");
  });

  it("converts camelCase", () => {
    expect(toKebabCase("userName")).toBe("user-name");
    expect(toKebabCase("blogPost")).toBe("blog-post");
  });

  it("converts PascalCase", () => {
    expect(toKebabCase("UserName")).toBe("user-name");
    expect(toKebabCase("BlogPost")).toBe("blog-post");
  });
});

// ============================================================================
// Pluralize / Singularize
// ============================================================================

describe("pluralize", () => {
  it("adds 's' to regular words", () => {
    expect(pluralize("user")).toBe("users");
    expect(pluralize("post")).toBe("posts");
    expect(pluralize("comment")).toBe("comments");
  });

  it("handles words ending in 'y'", () => {
    expect(pluralize("category")).toBe("categories");
    expect(pluralize("company")).toBe("companies");
  });

  it("handles words ending in 'y' with vowel before", () => {
    expect(pluralize("day")).toBe("days");
    expect(pluralize("key")).toBe("keys");
  });

  it("handles words ending in 's', 'x', 'ch', 'sh'", () => {
    expect(pluralize("class")).toBe("classes");
    expect(pluralize("box")).toBe("boxes");
    expect(pluralize("watch")).toBe("watches");
    expect(pluralize("wish")).toBe("wishes");
  });
});

describe("singularize", () => {
  it("removes 's' from regular plurals", () => {
    expect(singularize("users")).toBe("user");
    expect(singularize("posts")).toBe("post");
    expect(singularize("comments")).toBe("comment");
  });

  it("handles words ending in 'ies'", () => {
    expect(singularize("categories")).toBe("category");
    expect(singularize("companies")).toBe("company");
  });

  it("handles words ending in 'es'", () => {
    expect(singularize("classes")).toBe("class");
    expect(singularize("boxes")).toBe("box");
    expect(singularize("watches")).toBe("watch");
  });

  it("doesn't modify words ending in 'ss'", () => {
    expect(singularize("class")).toBe("class");
  });
});

// ============================================================================
// Model Context
// ============================================================================

describe("createModelContext", () => {
  it("creates context for simple model name", () => {
    const ctx = createModelContext("user");
    expect(ctx).toMatchObject({
      name: "user",
      singularName: "user",
      pluralName: "users",
      pascalName: "User",
      pascalPlural: "Users",
      camelName: "user",
      camelPlural: "users",
      snakeName: "user",
      snakePlural: "users",
      kebabName: "user",
      kebabPlural: "users",
      tableName: "users",
    });
  });

  it("creates context for plural model name", () => {
    const ctx = createModelContext("users");
    expect(ctx.singularName).toBe("user");
    expect(ctx.pluralName).toBe("users");
    expect(ctx.pascalName).toBe("User");
  });

  it("creates context for PascalCase model name", () => {
    const ctx = createModelContext("BlogPost");
    expect(ctx.singularName).toBe("BlogPost");
    expect(ctx.pascalName).toBe("BlogPost");
    expect(ctx.camelName).toBe("blogPost");
    expect(ctx.kebabPlural).toBe("blog-posts");
    expect(ctx.tableName).toBe("blog_posts");
  });
});
