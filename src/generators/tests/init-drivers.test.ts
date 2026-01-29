import { describe, it, expect } from "vitest";
import {
  DRIVERS,
  getDriversForDialect,
  getDriverConfig,
  isValidDriver,
  isDriverForDialect,
} from "../init/drivers";

describe("init/drivers", () => {
  describe("DRIVERS", () => {
    it("has all expected SQLite drivers", () => {
      expect(DRIVERS["better-sqlite3"]).toBeDefined();
      expect(DRIVERS["libsql"]).toBeDefined();
      expect(DRIVERS["bun:sqlite"]).toBeDefined();
    });

    it("has all expected PostgreSQL drivers", () => {
      expect(DRIVERS["postgres"]).toBeDefined();
      expect(DRIVERS["pg"]).toBeDefined();
      expect(DRIVERS["neon"]).toBeDefined();
      expect(DRIVERS["vercel-postgres"]).toBeDefined();
    });

    it("has all expected MySQL drivers", () => {
      expect(DRIVERS["mysql2"]).toBeDefined();
      expect(DRIVERS["planetscale"]).toBeDefined();
    });

    it("all drivers have required properties", () => {
      for (const [key, config] of Object.entries(DRIVERS)) {
        expect(config.name).toBeTruthy();
        expect(config.driver).toBe(key);
        expect(["sqlite", "postgresql", "mysql"]).toContain(config.dialect);
        expect(typeof config.package).toBe("string");
        expect(config.envVar).toBeTruthy();
        expect(config.envExample).toBeTruthy();
        expect(typeof config.requiresUrl).toBe("boolean");
      }
    });
  });

  describe("getDriversForDialect", () => {
    it("returns SQLite drivers for sqlite dialect", () => {
      const drivers = getDriversForDialect("sqlite");
      expect(drivers.length).toBe(3);
      expect(drivers.every((d) => d.dialect === "sqlite")).toBe(true);
    });

    it("returns PostgreSQL drivers for postgresql dialect", () => {
      const drivers = getDriversForDialect("postgresql");
      expect(drivers.length).toBe(4);
      expect(drivers.every((d) => d.dialect === "postgresql")).toBe(true);
    });

    it("returns MySQL drivers for mysql dialect", () => {
      const drivers = getDriversForDialect("mysql");
      expect(drivers.length).toBe(2);
      expect(drivers.every((d) => d.dialect === "mysql")).toBe(true);
    });
  });

  describe("getDriverConfig", () => {
    it("returns correct config for better-sqlite3", () => {
      const config = getDriverConfig("better-sqlite3");
      expect(config.name).toBe("better-sqlite3");
      expect(config.dialect).toBe("sqlite");
      expect(config.package).toBe("better-sqlite3");
    });

    it("returns correct config for postgres", () => {
      const config = getDriverConfig("postgres");
      expect(config.name).toBe("postgres.js");
      expect(config.dialect).toBe("postgresql");
      expect(config.package).toBe("postgres");
    });

    it("returns correct config for mysql2", () => {
      const config = getDriverConfig("mysql2");
      expect(config.name).toBe("mysql2");
      expect(config.dialect).toBe("mysql");
      expect(config.package).toBe("mysql2");
    });
  });

  describe("isValidDriver", () => {
    it("returns true for valid drivers", () => {
      expect(isValidDriver("better-sqlite3")).toBe(true);
      expect(isValidDriver("postgres")).toBe(true);
      expect(isValidDriver("mysql2")).toBe(true);
    });

    it("returns false for invalid drivers", () => {
      expect(isValidDriver("invalid")).toBe(false);
      expect(isValidDriver("")).toBe(false);
      expect(isValidDriver("sqlite3")).toBe(false);
    });
  });

  describe("isDriverForDialect", () => {
    it("returns true for matching dialect", () => {
      expect(isDriverForDialect("better-sqlite3", "sqlite")).toBe(true);
      expect(isDriverForDialect("postgres", "postgresql")).toBe(true);
      expect(isDriverForDialect("mysql2", "mysql")).toBe(true);
    });

    it("returns false for mismatched dialect", () => {
      expect(isDriverForDialect("better-sqlite3", "postgresql")).toBe(false);
      expect(isDriverForDialect("postgres", "sqlite")).toBe(false);
      expect(isDriverForDialect("mysql2", "postgresql")).toBe(false);
    });
  });
});
