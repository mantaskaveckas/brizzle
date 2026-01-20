import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

vi.mock("fs");

// Need to mock model and actions generators since scaffold calls them
vi.mock("../model", () => ({
  generateModel: vi.fn(),
}));

vi.mock("../actions", () => ({
  generateActions: vi.fn(),
}));

import { generateScaffold } from "../scaffold";
import { resetProjectConfig } from "../../lib";

describe("generateScaffold", () => {
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

  describe("page generation", () => {
    it("creates all four page files", () => {
      generateScaffold("post", ["title:string"]);

      const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
      const paths = writeCalls.map((call) => call[0]);

      expect(paths).toContainEqual(path.join(mockCwd, "app", "posts", "page.tsx"));
      expect(paths).toContainEqual(path.join(mockCwd, "app", "posts", "new", "page.tsx"));
      expect(paths).toContainEqual(path.join(mockCwd, "app", "posts", "[id]", "page.tsx"));
      expect(paths).toContainEqual(path.join(mockCwd, "app", "posts", "[id]", "edit", "page.tsx"));
    });

    it("uses kebab-case for directory names", () => {
      generateScaffold("blogPost", ["title:string"]);

      const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
      const paths = writeCalls.map((call) => call[0]);

      expect(paths.some((p) => String(p).includes("blog-posts"))).toBe(true);
    });
  });

  describe("index page", () => {
    it("includes correct imports and component name", () => {
      generateScaffold("post", ["title:string"]);

      const indexPage = getWrittenFile("posts/page.tsx");

      expect(indexPage).toContain('import Link from "next/link"');
      expect(indexPage).toContain("getPosts");
      expect(indexPage).toContain("deletePost");
      expect(indexPage).toContain("export default async function PostsPage()");
    });

    it("uses first field as display field", () => {
      generateScaffold("post", ["title:string", "body:text"]);

      const indexPage = getWrittenFile("posts/page.tsx");

      expect(indexPage).toContain("{post.title}");
    });

    it("includes new and edit links", () => {
      generateScaffold("post", ["title:string"]);

      const indexPage = getWrittenFile("posts/page.tsx");

      expect(indexPage).toContain('href="/posts/new"');
      expect(indexPage).toContain("/posts/${post.id}/edit");
    });
  });

  describe("new page (create form)", () => {
    it("includes correct imports", () => {
      generateScaffold("post", ["title:string"]);

      const newPage = getWrittenFile("posts/new/page.tsx");

      expect(newPage).toContain('import { redirect } from "next/navigation"');
      expect(newPage).toContain('import Link from "next/link"');
      expect(newPage).toContain("createPost");
    });

    it("generates form with handleCreate function", () => {
      generateScaffold("post", ["title:string"]);

      const newPage = getWrittenFile("posts/new/page.tsx");

      expect(newPage).toContain("async function handleCreate(formData: FormData)");
      expect(newPage).toContain('"use server"');
      expect(newPage).toContain('redirect("/posts")');
    });
  });

  describe("show page", () => {
    it("includes correct component structure", () => {
      generateScaffold("post", ["title:string", "body:text"]);

      const showPage = getWrittenFile("posts/[id]/page.tsx");

      expect(showPage).toContain("getPost");
      expect(showPage).toContain("notFound()");
      expect(showPage).toContain("params: Promise<{ id: string }>");
    });

    it("displays all fields", () => {
      generateScaffold("post", ["title:string", "body:text"]);

      const showPage = getWrittenFile("posts/[id]/page.tsx");

      expect(showPage).toContain("{post.title}");
      expect(showPage).toContain("{post.body}");
      expect(showPage).toContain("createdAt.toLocaleString()");
    });
  });

  describe("edit page", () => {
    it("includes update handler", () => {
      generateScaffold("post", ["title:string"]);

      const editPage = getWrittenFile("posts/[id]/edit/page.tsx");

      expect(editPage).toContain("updatePost");
      expect(editPage).toContain("async function handleUpdate(formData: FormData)");
    });

    it("includes form with defaultValue", () => {
      generateScaffold("post", ["title:string"]);

      const editPage = getWrittenFile("posts/[id]/edit/page.tsx");

      expect(editPage).toContain("defaultValue={post.title}");
    });
  });

  describe("form field generation", () => {
    describe("string fields", () => {
      it("generates text input", () => {
        generateScaffold("user", ["name:string"]);

        const newPage = getWrittenFile("users/new/page.tsx");

        expect(newPage).toContain('type="text"');
        expect(newPage).toContain('name="name"');
        expect(newPage).toContain("required");
      });
    });

    describe("text fields", () => {
      it("generates textarea", () => {
        generateScaffold("post", ["body:text"]);

        const newPage = getWrittenFile("posts/new/page.tsx");

        expect(newPage).toContain("<textarea");
        expect(newPage).toContain('name="body"');
        expect(newPage).toContain("rows={4}");
      });
    });

    describe("integer fields", () => {
      it("generates number input", () => {
        generateScaffold("product", ["quantity:integer"]);

        const newPage = getWrittenFile("products/new/page.tsx");

        expect(newPage).toContain('type="number"');
        expect(newPage).toContain('name="quantity"');
      });
    });

    describe("float fields", () => {
      it("generates number input with step=any", () => {
        generateScaffold("product", ["price:float"]);

        const newPage = getWrittenFile("products/new/page.tsx");

        expect(newPage).toContain('type="number"');
        expect(newPage).toContain('step="any"');
      });
    });

    describe("decimal fields", () => {
      it("generates number input with step=0.01", () => {
        generateScaffold("product", ["price:decimal"]);

        const newPage = getWrittenFile("products/new/page.tsx");

        expect(newPage).toContain('type="number"');
        expect(newPage).toContain('step="0.01"');
      });
    });

    describe("boolean fields", () => {
      it("generates checkbox input", () => {
        generateScaffold("post", ["published:boolean"]);

        const newPage = getWrittenFile("posts/new/page.tsx");

        expect(newPage).toContain('type="checkbox"');
        expect(newPage).toContain('name="published"');
      });

      it("uses defaultChecked for edit page", () => {
        generateScaffold("post", ["published:boolean"]);

        const editPage = getWrittenFile("posts/[id]/edit/page.tsx");

        expect(editPage).toContain("defaultChecked={post.published}");
      });
    });

    describe("datetime fields", () => {
      it("generates datetime-local input", () => {
        generateScaffold("event", ["startDate:datetime"]);

        const newPage = getWrittenFile("events/new/page.tsx");

        expect(newPage).toContain('type="datetime-local"');
        expect(newPage).toContain('name="startDate"');
      });
    });

    describe("date fields", () => {
      it("generates date input", () => {
        generateScaffold("event", ["eventDate:date"]);

        const newPage = getWrittenFile("events/new/page.tsx");

        expect(newPage).toContain('type="date"');
        expect(newPage).toContain('name="eventDate"');
      });
    });

    describe("enum fields", () => {
      it("generates select with options", () => {
        generateScaffold("post", ["status:enum:draft,published,archived"]);

        const newPage = getWrittenFile("posts/new/page.tsx");

        expect(newPage).toContain("<select");
        expect(newPage).toContain('name="status"');
        expect(newPage).toContain('<option value="draft">Draft</option>');
        expect(newPage).toContain('<option value="published">Published</option>');
        expect(newPage).toContain('<option value="archived">Archived</option>');
      });
    });

    describe("json fields", () => {
      it("generates textarea with 6 rows", () => {
        generateScaffold("config", ["settings:json"]);

        const newPage = getWrittenFile("configs/new/page.tsx");

        expect(newPage).toContain("<textarea");
        expect(newPage).toContain("rows={6}");
        expect(newPage).toContain('placeholder="{}"');
      });
    });

    describe("nullable fields", () => {
      it("shows optional label and no required attribute", () => {
        generateScaffold("user", ["bio:text?"]);

        const newPage = getWrittenFile("users/new/page.tsx");

        expect(newPage).toContain("(optional)");
        expect(newPage).not.toMatch(/name="bio"[^>]*required/);
      });
    });
  });

  describe("form data value parsing", () => {
    it("parses string fields correctly", () => {
      generateScaffold("user", ["name:string"]);

      const newPage = getWrittenFile("users/new/page.tsx");

      expect(newPage).toContain('name: formData.get("name") as string');
    });

    it("parses integer fields with parseInt", () => {
      generateScaffold("product", ["quantity:integer"]);

      const newPage = getWrittenFile("products/new/page.tsx");

      expect(newPage).toContain('quantity: parseInt(formData.get("quantity") as string)');
    });

    it("parses float fields with parseFloat", () => {
      generateScaffold("product", ["price:float"]);

      const newPage = getWrittenFile("products/new/page.tsx");

      expect(newPage).toContain('price: parseFloat(formData.get("price") as string)');
    });

    it("parses boolean fields with === on", () => {
      generateScaffold("post", ["published:boolean"]);

      const newPage = getWrittenFile("posts/new/page.tsx");

      expect(newPage).toContain('published: formData.get("published") === "on"');
    });

    it("parses datetime fields with new Date", () => {
      generateScaffold("event", ["startDate:datetime"]);

      const newPage = getWrittenFile("events/new/page.tsx");

      expect(newPage).toContain('startDate: new Date(formData.get("startDate") as string)');
    });

    it("parses json fields with JSON.parse", () => {
      generateScaffold("config", ["settings:json"]);

      const newPage = getWrittenFile("configs/new/page.tsx");

      expect(newPage).toContain('settings: JSON.parse(formData.get("settings") as string)');
    });

    it("handles nullable fields with conditional", () => {
      generateScaffold("user", ["bio:text?"]);

      const newPage = getWrittenFile("users/new/page.tsx");

      expect(newPage).toContain('bio: formData.get("bio") ? formData.get("bio") as string : null');
    });

    it("handles nullable integer fields", () => {
      generateScaffold("product", ["discount:integer?"]);

      const newPage = getWrittenFile("products/new/page.tsx");

      expect(newPage).toContain('formData.get("discount") ? parseInt(');
      expect(newPage).toContain(": null");
    });
  });

  // Helper function to get written file content
  function getWrittenFile(pathSuffix: string): string {
    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const call = writeCalls.find((c) => String(c[0]).includes(pathSuffix));
    if (!call) {
      throw new Error(`File not found: ${pathSuffix}`);
    }
    return call[1] as string;
  }
});
