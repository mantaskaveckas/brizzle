import { describe, it, expect } from "vitest";
import { validateModelName, validateFieldDefinition } from "..";

describe("validateModelName", () => {
  it("accepts valid model names", () => {
    expect(() => validateModelName("User")).not.toThrow();
    expect(() => validateModelName("BlogPost")).not.toThrow();
    expect(() => validateModelName("user")).not.toThrow();
    expect(() => validateModelName("post123")).not.toThrow();
  });

  it("rejects empty names", () => {
    expect(() => validateModelName("")).toThrow("Model name is required");
  });

  it("rejects names starting with numbers", () => {
    expect(() => validateModelName("123user")).toThrow("Invalid model name");
  });

  it("rejects names with special characters", () => {
    expect(() => validateModelName("user-name")).toThrow("Invalid model name");
    expect(() => validateModelName("user_name")).toThrow("Invalid model name");
    expect(() => validateModelName("user.name")).toThrow("Invalid model name");
  });

  it("rejects reserved words", () => {
    expect(() => validateModelName("model")).toThrow("reserved word");
    expect(() => validateModelName("schema")).toThrow("reserved word");
    expect(() => validateModelName("db")).toThrow("reserved word");
    expect(() => validateModelName("database")).toThrow("reserved word");
    expect(() => validateModelName("table")).toThrow("reserved word");
  });
});

describe("validateFieldDefinition", () => {
  it("accepts valid field definitions", () => {
    expect(() => validateFieldDefinition("name:string")).not.toThrow();
    expect(() => validateFieldDefinition("age:integer")).not.toThrow();
    expect(() => validateFieldDefinition("active:boolean")).not.toThrow();
    expect(() => validateFieldDefinition("title")).not.toThrow(); // defaults to string
  });

  it("accepts nullable fields", () => {
    expect(() => validateFieldDefinition("bio:text?")).not.toThrow();
    expect(() => validateFieldDefinition("nickname?")).not.toThrow();
  });

  it("accepts unique modifier", () => {
    expect(() => validateFieldDefinition("email:string:unique")).not.toThrow();
  });

  it("accepts enum fields", () => {
    expect(() => validateFieldDefinition("status:enum:draft,published")).not.toThrow();
  });

  it("accepts reference fields", () => {
    expect(() => validateFieldDefinition("userId:references:user")).not.toThrow();
  });

  it("rejects invalid field names", () => {
    expect(() => validateFieldDefinition("UserName:string")).toThrow("Invalid field name");
    expect(() => validateFieldDefinition("user-name:string")).toThrow("Invalid field name");
    expect(() => validateFieldDefinition("123name:string")).toThrow("Invalid field name");
  });

  it("rejects invalid field types", () => {
    expect(() => validateFieldDefinition("name:invalid")).toThrow("Invalid field type");
    expect(() => validateFieldDefinition("name:foo")).toThrow("Invalid field type");
  });

  it("rejects enum without values", () => {
    expect(() => validateFieldDefinition("status:enum")).toThrow("requires values");
  });
});
