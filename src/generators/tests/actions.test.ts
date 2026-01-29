import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

vi.mock("fs");

import { generateActions } from "../actions";
import { resetProjectConfig } from "../../lib";

describe("generateActions", () => {
  const mockCwd = "/test/project";

  beforeEach(() => {
    vi.clearAllMocks();
    resetProjectConfig();
    vi.spyOn(process, "cwd").mockReturnValue(mockCwd);
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("file generation", () => {
    it("creates actions file in correct location", () => {
      generateActions("post");

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockCwd, "app", "posts", "actions.ts"),
        expect.any(String)
      );
    });

    it("uses kebab-case for directory name", () => {
      generateActions("blogPost");

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockCwd, "app", "blog-posts", "actions.ts"),
        expect.any(String)
      );
    });
  });

  describe("content generation", () => {
    it("includes use server directive", () => {
      generateActions("post");

      const content = getWrittenContent();

      expect(content).toContain('"use server"');
    });

    it("includes correct imports", () => {
      generateActions("post");

      const content = getWrittenContent();

      expect(content).toContain('import { db } from "@/db"');
      expect(content).toContain('import { posts } from "@/db/schema"');
      expect(content).toContain('import { eq, desc } from "drizzle-orm"');
      expect(content).toContain('import { revalidatePath } from "next/cache"');
    });

    it("exports type definitions", () => {
      generateActions("post");

      const content = getWrittenContent();

      expect(content).toContain("export type Post = typeof posts.$inferSelect");
      expect(content).toContain("export type NewPost = typeof posts.$inferInsert");
    });

    it("generates getAll function", () => {
      generateActions("post");

      const content = getWrittenContent();

      expect(content).toContain("export async function getPosts()");
      expect(content).toContain("db.select().from(posts)");
      expect(content).toContain("orderBy(desc(posts.createdAt))");
    });

    it("generates getOne function", () => {
      generateActions("post");

      const content = getWrittenContent();

      expect(content).toContain("export async function getPost(id: number)");
      expect(content).toContain("where(eq(posts.id, id))");
      expect(content).toContain("limit(1)");
      expect(content).toContain("result[0] ?? null");
    });

    it("generates create function", () => {
      generateActions("post");

      const content = getWrittenContent();

      expect(content).toContain("export async function createPost(data: Omit<NewPost");
      expect(content).toContain("db.insert(posts).values(data).returning()");
      expect(content).toContain('revalidatePath("/posts")');
    });

    it("generates update function", () => {
      generateActions("post");

      const content = getWrittenContent();

      expect(content).toContain("export async function updatePost(");
      expect(content).toContain("id: number");
      expect(content).toContain("Partial<Omit<NewPost");
      expect(content).toContain(".update(posts)");
      expect(content).toContain("updatedAt: new Date()");
      expect(content).toContain('revalidatePath("/posts")');
    });

    it("generates delete function", () => {
      generateActions("post");

      const content = getWrittenContent();

      expect(content).toContain("export async function deletePost(id: number)");
      expect(content).toContain("db.delete(posts).where(eq(posts.id, id))");
      expect(content).toContain('revalidatePath("/posts")');
    });
  });

  describe("naming conventions", () => {
    it("uses PascalCase for type names", () => {
      generateActions("blogPost");

      const content = getWrittenContent();

      expect(content).toContain("type BlogPost =");
      expect(content).toContain("type NewBlogPost =");
    });

    it("uses camelCase for table references", () => {
      generateActions("blogPost");

      const content = getWrittenContent();

      expect(content).toContain("import { blogPosts } from");
      expect(content).toContain("from(blogPosts)");
    });

    it("uses kebab-case for paths", () => {
      generateActions("blogPost");

      const content = getWrittenContent();

      expect(content).toContain('revalidatePath("/blog-posts")');
    });
  });

  describe("error handling", () => {
    it("throws error for invalid model name", () => {
      expect(() => generateActions("123invalid")).toThrow("Invalid model name");
    });

    it("throws error for reserved model name", () => {
      expect(() => generateActions("model")).toThrow("reserved word");
    });
  });

  describe("MySQL dialect", () => {
    beforeEach(() => {
      // Mock drizzle.config.ts to return MySQL dialect
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        if (String(p).endsWith("drizzle.config.ts")) return true;
        return false;
      });
      vi.mocked(fs.readFileSync).mockImplementation((p) => {
        if (String(p).endsWith("drizzle.config.ts")) {
          return 'dialect: "mysql"';
        }
        return "";
      });
    });

    it("uses $returningId() instead of returning() for create", () => {
      generateActions("post");

      const content = getWrittenContent();

      expect(content).toContain(".$returningId()");
      expect(content).not.toContain(".returning()");
    });

    it("fetches record after insert for create", () => {
      generateActions("post");

      const content = getWrittenContent();

      expect(content).toContain(
        "const inserted = await db.insert(posts).values(data).$returningId()"
      );
      expect(content).toContain("where(eq(posts.id, inserted[0].id))");
    });

    it("fetches record after update", () => {
      generateActions("post");

      const content = getWrittenContent();

      // Update should not use returning()
      expect(content).toMatch(/\.update\(posts\)[\s\S]*\.set\(/);
      // Should fetch after update
      expect(content).toMatch(/await db\s*\.update[\s\S]*await db\s*\.select/);
    });
  });

  // Helper function
  function getWrittenContent(): string {
    const call = vi.mocked(fs.writeFileSync).mock.calls[0];
    return call[1] as string;
  }
});
