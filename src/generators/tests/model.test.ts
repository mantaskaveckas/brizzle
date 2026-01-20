import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

// Mock fs module
vi.mock("fs");

// Import after mocking
import { generateModel } from "../model";
import { resetProjectConfig } from "../../lib";

describe("generateModel", () => {
  const mockCwd = "/test/project";

  beforeEach(() => {
    vi.clearAllMocks();
    resetProjectConfig();
    vi.spyOn(process, "cwd").mockReturnValue(mockCwd);
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
    vi.mocked(fs.readFileSync).mockReturnValue("");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("schema generation", () => {
    it("creates schema file with correct path", () => {
      generateModel("user", ["name:string", "email:string"]);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockCwd, "db", "schema.ts"),
        expect.any(String)
      );
    });

    it("generates correct table name", () => {
      generateModel("user", ["name:string"]);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain('sqliteTable("users"');
    });

    it("generates correct import statement", () => {
      generateModel("user", ["name:string"]);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain('from "drizzle-orm/sqlite-core"');
    });

    it("includes id column with auto increment", () => {
      generateModel("user", ["name:string"]);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain('id: integer("id").primaryKey({ autoIncrement: true })');
    });

    it("includes timestamp columns by default", () => {
      generateModel("user", ["name:string"]);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain('createdAt: integer("created_at"');
      expect(content).toContain('updatedAt: integer("updated_at"');
    });

    it("excludes timestamp columns with noTimestamps option", () => {
      generateModel("user", ["name:string"], { noTimestamps: true });

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).not.toContain("createdAt");
      expect(content).not.toContain("updatedAt");
    });

    it("uses UUID for id with uuid option", () => {
      generateModel("user", ["name:string"], { uuid: true });

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain('id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID())');
    });
  });

  describe("field generation", () => {
    it("generates string fields correctly", () => {
      generateModel("user", ["name:string"]);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain('name: text("name").notNull()');
    });

    it("generates integer fields correctly", () => {
      generateModel("user", ["age:integer"]);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain('age: integer("age").notNull()');
    });

    it("generates boolean fields correctly", () => {
      generateModel("user", ["active:boolean"]);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain("active:");
      expect(content).toContain("integer");
      expect(content).toContain("boolean");
    });

    it("generates text fields correctly", () => {
      generateModel("post", ["body:text"]);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain('body: text("body").notNull()');
    });

    it("generates float fields correctly", () => {
      generateModel("product", ["price:float"]);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain('price: real("price").notNull()');
    });

    it("generates nullable fields without notNull", () => {
      generateModel("user", ["bio:text?"]);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      // Should have the field - nullable fields don't have .notNull()
      expect(content).toContain('bio: text("bio"),');
      // Make sure it doesn't have .notNull() immediately after
      expect(content).not.toMatch(/bio: text\("bio"\)\.notNull\(\)/);
    });

    it("generates unique fields with unique modifier", () => {
      generateModel("user", ["email:string:unique"]);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain(".unique()");
    });

    it("generates datetime fields correctly", () => {
      generateModel("event", ["startDate:datetime"]);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain("startDate:");
      expect(content).toContain('"start_date"');
      expect(content).toContain("timestamp");
    });
  });

  describe("enum fields", () => {
    it("generates enum fields with text and enum option for sqlite", () => {
      generateModel("post", ["status:enum:draft,published,archived"]);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain('status: text("status", { enum: ["draft", "published", "archived"] })');
    });
  });

  describe("reference fields", () => {
    it("generates reference fields correctly", () => {
      generateModel("post", ["authorId:references:user"]);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain('authorId: integer("author_id").references(() => users.id)');
    });
  });

  describe("snake_case column names", () => {
    it("converts camelCase field names to snake_case column names", () => {
      generateModel("user", ["firstName:string", "lastName:string", "createdAt:datetime"]);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain('"first_name"');
      expect(content).toContain('"last_name"');
    });
  });

  // Note: dry run mode is tested via integration tests since it requires
  // proper module isolation that's complex with mocked fs

  describe("error handling", () => {
    it("throws error for invalid model name", () => {
      expect(() => generateModel("123invalid", ["name:string"])).toThrow("Invalid model name");
    });

    it("throws error for reserved model name", () => {
      expect(() => generateModel("model", ["name:string"])).toThrow("reserved word");
    });

    it("throws error for invalid field type", () => {
      expect(() => generateModel("user", ["name:invalidtype"])).toThrow("Invalid field type");
    });
  });

  describe("appending to existing schema", () => {
    it("appends to existing schema file", () => {
      const existingSchema = `import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
});
`;
      // Mock existsSync to return true for schema file
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        return String(p).includes("schema.ts");
      });
      vi.mocked(fs.readFileSync).mockReturnValue(existingSchema);

      generateModel("user", ["name:string"]);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = writeCall[1] as string;

      // Should contain both existing and new table
      expect(content).toContain('sqliteTable("posts"');
      expect(content).toContain('sqliteTable("users"');
    });
  });
});
