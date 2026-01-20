import { describe, it, expect } from "vitest";
import {
  drizzleType,
  getTableFunction,
  getIdColumn,
  getDrizzleImport,
} from "..";

describe("getTableFunction", () => {
  it("returns correct function for each dialect", () => {
    expect(getTableFunction("sqlite")).toBe("sqliteTable");
    expect(getTableFunction("postgresql")).toBe("pgTable");
    expect(getTableFunction("mysql")).toBe("mysqlTable");
  });
});

describe("getDrizzleImport", () => {
  it("returns correct import path for each dialect", () => {
    expect(getDrizzleImport("sqlite")).toBe("drizzle-orm/sqlite-core");
    expect(getDrizzleImport("postgresql")).toBe("drizzle-orm/pg-core");
    expect(getDrizzleImport("mysql")).toBe("drizzle-orm/mysql-core");
  });
});

describe("getIdColumn", () => {
  it("returns auto-increment id for default", () => {
    expect(getIdColumn("sqlite")).toContain("integer");
    expect(getIdColumn("sqlite")).toContain("primaryKey");
    expect(getIdColumn("sqlite")).toContain("autoIncrement");
  });

  it("returns serial for postgresql", () => {
    expect(getIdColumn("postgresql")).toContain("serial");
    expect(getIdColumn("postgresql")).toContain("primaryKey");
  });

  it("returns uuid when useUuid is true", () => {
    expect(getIdColumn("sqlite", true)).toContain("text");
    expect(getIdColumn("sqlite", true)).toContain("randomUUID");

    expect(getIdColumn("postgresql", true)).toContain("uuid");
    expect(getIdColumn("postgresql", true)).toContain("defaultRandom");

    expect(getIdColumn("mysql", true)).toContain("varchar");
    expect(getIdColumn("mysql", true)).toContain("randomUUID");
  });
});

describe("drizzleType", () => {
  const stringField = { name: "name", type: "string", isReference: false, isEnum: false, nullable: false, unique: false };
  const intField = { name: "age", type: "integer", isReference: false, isEnum: false, nullable: false, unique: false };
  const boolField = { name: "active", type: "boolean", isReference: false, isEnum: false, nullable: false, unique: false };
  const floatField = { name: "price", type: "float", isReference: false, isEnum: false, nullable: false, unique: false };
  const jsonField = { name: "data", type: "json", isReference: false, isEnum: false, nullable: false, unique: false };
  const uuidField = { name: "token", type: "uuid", isReference: false, isEnum: false, nullable: false, unique: false };

  describe("sqlite", () => {
    it("maps types correctly", () => {
      expect(drizzleType(stringField, "sqlite")).toBe("text");
      expect(drizzleType(intField, "sqlite")).toBe("integer");
      expect(drizzleType(boolField, "sqlite")).toContain("integer");
      expect(drizzleType(boolField, "sqlite")).toContain("boolean");
      expect(drizzleType(floatField, "sqlite")).toBe("real");
      expect(drizzleType(jsonField, "sqlite")).toBe("text");
      expect(drizzleType(uuidField, "sqlite")).toBe("text");
    });
  });

  describe("postgresql", () => {
    it("maps types correctly", () => {
      expect(drizzleType(stringField, "postgresql")).toBe("text");
      expect(drizzleType(intField, "postgresql")).toBe("integer");
      expect(drizzleType(boolField, "postgresql")).toBe("boolean");
      expect(drizzleType(floatField, "postgresql")).toBe("doublePrecision");
      expect(drizzleType(jsonField, "postgresql")).toBe("jsonb");
      expect(drizzleType(uuidField, "postgresql")).toBe("uuid");
    });
  });

  describe("mysql", () => {
    it("maps types correctly", () => {
      expect(drizzleType(stringField, "mysql")).toBe("varchar");
      expect(drizzleType(intField, "mysql")).toBe("int");
      expect(drizzleType(boolField, "mysql")).toBe("boolean");
      expect(drizzleType(floatField, "mysql")).toBe("double");
      expect(drizzleType(jsonField, "mysql")).toBe("json");
      expect(drizzleType(uuidField, "mysql")).toBe("varchar");
    });
  });
});
