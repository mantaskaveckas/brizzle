import { describe, it, expect } from "vitest";
import { parseFields } from "..";

describe("parseFields", () => {
  it("parses simple fields with default type", () => {
    const fields = parseFields(["name"]);
    expect(fields).toHaveLength(1);
    expect(fields[0]).toMatchObject({
      name: "name",
      type: "string",
      isReference: false,
      isEnum: false,
      nullable: false,
      unique: false,
    });
  });

  it("parses fields with explicit type", () => {
    const fields = parseFields(["name:string", "age:integer", "bio:text"]);
    expect(fields).toHaveLength(3);
    expect(fields[0].type).toBe("string");
    expect(fields[1].type).toBe("integer");
    expect(fields[2].type).toBe("text");
  });

  it("parses nullable fields with ? on name", () => {
    const fields = parseFields(["bio?"]);
    expect(fields[0]).toMatchObject({
      name: "bio",
      nullable: true,
    });
  });

  it("parses nullable fields with ? on type", () => {
    const fields = parseFields(["bio:text?"]);
    expect(fields[0]).toMatchObject({
      name: "bio",
      type: "text",
      nullable: true,
    });
  });

  it("parses unique fields", () => {
    const fields = parseFields(["email:string:unique"]);
    expect(fields[0]).toMatchObject({
      name: "email",
      type: "string",
      unique: true,
    });
  });

  it("parses enum fields", () => {
    const fields = parseFields(["status:enum:draft,published,archived"]);
    expect(fields[0]).toMatchObject({
      name: "status",
      type: "enum",
      isEnum: true,
      enumValues: ["draft", "published", "archived"],
    });
  });

  it("parses reference fields", () => {
    const fields = parseFields(["userId:references:user"]);
    expect(fields[0]).toMatchObject({
      name: "userId",
      type: "integer",
      isReference: true,
      referenceTo: "user",
    });
  });

  it("parses multiple fields", () => {
    const fields = parseFields([
      "title:string",
      "body:text",
      "published:boolean",
      "authorId:references:user",
    ]);
    expect(fields).toHaveLength(4);
  });
});
