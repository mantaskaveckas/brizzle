import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

vi.mock("fs");

import { destroyScaffold, destroyResource, destroyApi } from "../destroy";
import { resetProjectConfig } from "../../lib";

describe("destroy generators", () => {
  const mockCwd = "/test/project";

  beforeEach(() => {
    vi.clearAllMocks();
    resetProjectConfig();
    vi.spyOn(process, "cwd").mockReturnValue(mockCwd);
    // Mock existsSync to return false for src/app (no src directory) but true for delete checks
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const pathStr = String(p);
      // Return false for src/app detection, true for delete directory checks
      if (pathStr.includes("src/app")) return false;
      return true;
    });
    vi.mocked(fs.rmSync).mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("destroyScaffold", () => {
    it("deletes scaffold directory", () => {
      destroyScaffold("post");

      expect(fs.rmSync).toHaveBeenCalledWith(
        path.join(mockCwd, "app", "posts"),
        { recursive: true }
      );
    });

    it("uses kebab-case for directory name", () => {
      destroyScaffold("blogPost");

      expect(fs.rmSync).toHaveBeenCalledWith(
        path.join(mockCwd, "app", "blog-posts"),
        { recursive: true }
      );
    });

    it("handles plural model names", () => {
      destroyScaffold("users");

      expect(fs.rmSync).toHaveBeenCalledWith(
        path.join(mockCwd, "app", "users"),
        { recursive: true }
      );
    });

    it("does not delete in dry run mode", () => {
      destroyScaffold("post", { dryRun: true });

      expect(fs.rmSync).not.toHaveBeenCalled();
    });

    it("throws error for invalid model name", () => {
      expect(() => destroyScaffold("123invalid")).toThrow("Invalid model name");
    });

    it("throws error for reserved model name", () => {
      expect(() => destroyScaffold("model")).toThrow("reserved word");
    });
  });

  describe("destroyResource", () => {
    it("deletes resource directory", () => {
      destroyResource("post");

      expect(fs.rmSync).toHaveBeenCalledWith(
        path.join(mockCwd, "app", "posts"),
        { recursive: true }
      );
    });

    it("uses kebab-case for directory name", () => {
      destroyResource("blogPost");

      expect(fs.rmSync).toHaveBeenCalledWith(
        path.join(mockCwd, "app", "blog-posts"),
        { recursive: true }
      );
    });

    it("does not delete in dry run mode", () => {
      destroyResource("post", { dryRun: true });

      expect(fs.rmSync).not.toHaveBeenCalled();
    });

    it("throws error for invalid model name", () => {
      expect(() => destroyResource("123invalid")).toThrow("Invalid model name");
    });
  });

  describe("destroyApi", () => {
    it("deletes API directory", () => {
      destroyApi("post");

      expect(fs.rmSync).toHaveBeenCalledWith(
        path.join(mockCwd, "app", "api", "posts"),
        { recursive: true }
      );
    });

    it("uses kebab-case for directory name", () => {
      destroyApi("blogPost");

      expect(fs.rmSync).toHaveBeenCalledWith(
        path.join(mockCwd, "app", "api", "blog-posts"),
        { recursive: true }
      );
    });

    it("does not delete in dry run mode", () => {
      destroyApi("post", { dryRun: true });

      expect(fs.rmSync).not.toHaveBeenCalled();
    });

    it("throws error for invalid model name", () => {
      expect(() => destroyApi("123invalid")).toThrow("Invalid model name");
    });

    it("throws error for reserved model name", () => {
      expect(() => destroyApi("model")).toThrow("reserved word");
    });
  });

  describe("non-existent directories", () => {
    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
    });

    it("does not call rmSync if directory does not exist", () => {
      destroyScaffold("post");

      expect(fs.rmSync).not.toHaveBeenCalled();
    });

    it("does not call rmSync for resource if directory does not exist", () => {
      destroyResource("post");

      expect(fs.rmSync).not.toHaveBeenCalled();
    });

    it("does not call rmSync for api if directory does not exist", () => {
      destroyApi("post");

      expect(fs.rmSync).not.toHaveBeenCalled();
    });
  });
});
