import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../model", () => ({
  generateModel: vi.fn(),
}));

vi.mock("../actions", () => ({
  generateActions: vi.fn(),
}));

import { generateResource } from "../resource";
import { generateModel } from "../model";
import { generateActions } from "../actions";

describe("generateResource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("generator composition", () => {
    it("calls generateModel with correct arguments", () => {
      generateResource("post", ["title:string", "body:text"]);

      expect(generateModel).toHaveBeenCalledWith(
        "post",
        ["title:string", "body:text"],
        {}
      );
    });

    it("calls generateActions with correct arguments", () => {
      generateResource("post", ["title:string"]);

      expect(generateActions).toHaveBeenCalledWith("post", {});
    });

    it("passes options to generateModel", () => {
      generateResource("post", ["title:string"], { uuid: true, noTimestamps: true });

      expect(generateModel).toHaveBeenCalledWith(
        "post",
        ["title:string"],
        { uuid: true, noTimestamps: true }
      );
    });

    it("passes options to generateActions", () => {
      generateResource("post", ["title:string"], { dryRun: true });

      expect(generateActions).toHaveBeenCalledWith("post", { dryRun: true });
    });
  });

  describe("naming conventions", () => {
    it("uses singular name for model and actions", () => {
      generateResource("posts", ["title:string"]);

      expect(generateModel).toHaveBeenCalledWith(
        "post",
        ["title:string"],
        {}
      );
      expect(generateActions).toHaveBeenCalledWith("post", {});
    });

    it("handles PascalCase names", () => {
      generateResource("BlogPost", ["title:string"]);

      expect(generateModel).toHaveBeenCalledWith(
        "BlogPost",
        ["title:string"],
        {}
      );
      expect(generateActions).toHaveBeenCalledWith("BlogPost", {});
    });
  });

  describe("error handling", () => {
    it("throws error for invalid model name", () => {
      expect(() => generateResource("123invalid", [])).toThrow("Invalid model name");
    });

    it("throws error for reserved model name", () => {
      expect(() => generateResource("model", [])).toThrow("reserved word");
    });

    it("throws error for reserved word 'schema'", () => {
      expect(() => generateResource("schema", [])).toThrow("reserved word");
    });

    it("throws error for reserved word 'db'", () => {
      expect(() => generateResource("db", [])).toThrow("reserved word");
    });
  });

  describe("dry run mode", () => {
    it("propagates dryRun option to sub-generators", () => {
      generateResource("post", ["title:string"], { dryRun: true });

      expect(generateModel).toHaveBeenCalledWith(
        "post",
        ["title:string"],
        { dryRun: true }
      );
      expect(generateActions).toHaveBeenCalledWith("post", { dryRun: true });
    });
  });
});
