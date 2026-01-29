import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

// Mock fs module
vi.mock("fs");

// Import after mocking
import { checkExistingFiles, addScriptsToPackageJson } from "../init/prompts";
import { resetProjectConfig } from "../../lib";

describe("init/prompts", () => {
  const mockCwd = "/test/project";

  beforeEach(() => {
    vi.clearAllMocks();
    resetProjectConfig();
    vi.spyOn(process, "cwd").mockReturnValue(mockCwd);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkExistingFiles", () => {
    it("returns false for all when no files exist", () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = checkExistingFiles("db");

      expect(result.drizzleConfig).toBe(false);
      expect(result.dbIndex).toBe(false);
      expect(result.schema).toBe(false);
      expect(result.envExample).toBe(false);
      expect(result.dockerCompose).toBe(false);
    });

    it("returns true for files that exist", () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = String(p);
        return pathStr.includes("drizzle.config.ts") || pathStr.includes("schema.ts");
      });

      const result = checkExistingFiles("db");

      expect(result.drizzleConfig).toBe(true);
      expect(result.schema).toBe(true);
      expect(result.dbIndex).toBe(false);
    });

    it("checks correct paths for custom dbPath", () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      checkExistingFiles("src/db");

      expect(fs.existsSync).toHaveBeenCalledWith(path.join(mockCwd, "src/db", "index.ts"));
      expect(fs.existsSync).toHaveBeenCalledWith(path.join(mockCwd, "src/db", "schema.ts"));
    });
  });

  describe("addScriptsToPackageJson", () => {
    it("returns false when package.json does not exist", () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = addScriptsToPackageJson();

      expect(result).toBe(false);
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it("adds scripts to package.json", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          name: "test-project",
          scripts: {
            dev: "next dev",
          },
        })
      );

      const result = addScriptsToPackageJson();

      expect(result).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = JSON.parse(writeCall[1] as string);

      expect(content.scripts["db:generate"]).toBe("drizzle-kit generate");
      expect(content.scripts["db:migrate"]).toBe("drizzle-kit migrate");
      expect(content.scripts["db:push"]).toBe("drizzle-kit push");
      expect(content.scripts["db:studio"]).toBe("drizzle-kit studio");
      expect(content.scripts["dev"]).toBe("next dev"); // Preserved
    });

    it("does not overwrite existing scripts", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          name: "test-project",
          scripts: {
            "db:push": "custom db push command",
          },
        })
      );

      addScriptsToPackageJson();

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = JSON.parse(writeCall[1] as string);

      expect(content.scripts["db:push"]).toBe("custom db push command");
      expect(content.scripts["db:generate"]).toBe("drizzle-kit generate");
    });

    it("creates scripts object if it does not exist", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          name: "test-project",
        })
      );

      addScriptsToPackageJson();

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const content = JSON.parse(writeCall[1] as string);

      expect(content.scripts).toBeDefined();
      expect(content.scripts["db:generate"]).toBe("drizzle-kit generate");
    });

    it("returns true but does not write if all scripts exist", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          name: "test-project",
          scripts: {
            "db:generate": "drizzle-kit generate",
            "db:migrate": "drizzle-kit migrate",
            "db:push": "drizzle-kit push",
            "db:studio": "drizzle-kit studio",
          },
        })
      );

      const result = addScriptsToPackageJson();

      expect(result).toBe(true);
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it("handles JSON parse errors gracefully", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue("invalid json");

      const result = addScriptsToPackageJson();

      expect(result).toBe(false);
    });
  });
});
