import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs";

vi.mock("fs");

import {
  detectProjectConfig,
  getDbImport,
  getSchemaImport,
  resetProjectConfig,
} from "..";

describe("detectProjectConfig", () => {
  const mockCwd = "/test/project";

  beforeEach(() => {
    vi.clearAllMocks();
    resetProjectConfig();
    vi.spyOn(process, "cwd").mockReturnValue(mockCwd);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("detects non-src project structure", () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const pathStr = String(p);
      if (pathStr.includes("src/app")) return false;
      if (pathStr.endsWith("/db")) return true;
      return false;
    });
    vi.mocked(fs.readFileSync).mockReturnValue("");

    const config = detectProjectConfig();

    expect(config.useSrc).toBe(false);
    expect(config.appPath).toBe("app");
    expect(config.dbPath).toBe("db");
  });

  it("detects src project structure", () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const pathStr = String(p);
      if (pathStr.includes("src/app")) return true;
      if (pathStr.includes("src/db")) return true;
      return false;
    });
    vi.mocked(fs.readFileSync).mockReturnValue("");

    const config = detectProjectConfig();

    expect(config.useSrc).toBe(true);
    expect(config.appPath).toBe("src/app");
    expect(config.dbPath).toBe("src/db");
  });

  it("detects path alias from tsconfig.json", () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const pathStr = String(p);
      if (pathStr.includes("tsconfig.json")) return true;
      if (pathStr.endsWith("/db")) return true;
      return false;
    });
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
      compilerOptions: {
        paths: {
          "@/*": ["./src/*"]
        }
      }
    }));

    const config = detectProjectConfig();

    expect(config.alias).toBe("@");
  });

  it("detects tilde alias from tsconfig.json", () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const pathStr = String(p);
      if (pathStr.includes("tsconfig.json")) return true;
      if (pathStr.endsWith("/db")) return true;
      return false;
    });
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
      compilerOptions: {
        paths: {
          "~/*": ["./src/*"]
        }
      }
    }));

    const config = detectProjectConfig();

    expect(config.alias).toBe("~");
  });

  it("defaults to @ when no paths in tsconfig", () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const pathStr = String(p);
      if (pathStr.includes("tsconfig.json")) return true;
      if (pathStr.endsWith("/db")) return true;
      return false;
    });
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
      compilerOptions: {}
    }));

    const config = detectProjectConfig();

    expect(config.alias).toBe("@");
  });

  it("detects lib/db as db path", () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const pathStr = String(p);
      if (pathStr.includes("src/app")) return false;
      // Only match lib/db, not db
      if (pathStr === "/test/project/db") return false;
      if (pathStr === "/test/project/lib/db") return true;
      return false;
    });
    vi.mocked(fs.readFileSync).mockReturnValue("");

    const config = detectProjectConfig();

    expect(config.dbPath).toBe("lib/db");
  });
});

describe("getDbImport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetProjectConfig();
    vi.spyOn(process, "cwd").mockReturnValue("/test/project");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns correct import for non-src project", () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const pathStr = String(p);
      if (pathStr.includes("src/app")) return false;
      if (pathStr.endsWith("/db")) return true;
      return false;
    });
    vi.mocked(fs.readFileSync).mockReturnValue("");

    expect(getDbImport()).toBe("@/db");
  });

  it("returns correct import for src project", () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const pathStr = String(p);
      if (pathStr.includes("src/app")) return true;
      if (pathStr.includes("src/db")) return true;
      return false;
    });
    vi.mocked(fs.readFileSync).mockReturnValue("");

    // src/db -> db (strips src/)
    expect(getDbImport()).toBe("@/db");
  });

  it("uses detected alias", () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const pathStr = String(p);
      if (pathStr.includes("tsconfig.json")) return true;
      if (pathStr.endsWith("/db")) return true;
      return false;
    });
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
      compilerOptions: {
        paths: { "~/*": ["./src/*"] }
      }
    }));

    expect(getDbImport()).toBe("~/db");
  });

  it("handles lib/db path", () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const pathStr = String(p);
      if (pathStr.includes("src/app")) return false;
      if (pathStr === "/test/project/db") return false;
      if (pathStr === "/test/project/lib/db") return true;
      return false;
    });
    vi.mocked(fs.readFileSync).mockReturnValue("");

    expect(getDbImport()).toBe("@/lib/db");
  });
});

describe("getSchemaImport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetProjectConfig();
    vi.spyOn(process, "cwd").mockReturnValue("/test/project");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns correct schema import path", () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const pathStr = String(p);
      if (pathStr.includes("src/app")) return false;
      if (pathStr.endsWith("/db")) return true;
      return false;
    });
    vi.mocked(fs.readFileSync).mockReturnValue("");

    expect(getSchemaImport()).toBe("@/db/schema");
  });

  it("returns correct schema import for lib/db", () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const pathStr = String(p);
      if (pathStr.includes("src/app")) return false;
      if (pathStr === "/test/project/db") return false;
      if (pathStr === "/test/project/lib/db") return true;
      return false;
    });
    vi.mocked(fs.readFileSync).mockReturnValue("");

    expect(getSchemaImport()).toBe("@/lib/db/schema");
  });
});
