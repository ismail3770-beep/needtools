import { describe, expect, it } from "vitest";
import { baseName, parsePageRange } from "./pageRange";

describe("parsePageRange", () => {
  it("parses single pages into zero-based indices", () => {
    expect(parsePageRange("1", 10)).toEqual([0]);
    expect(parsePageRange("1,3,5", 10)).toEqual([0, 2, 4]);
  });

  it("expands inclusive ranges", () => {
    expect(parsePageRange("5-7", 10)).toEqual([4, 5, 6]);
  });

  it("handles mixed input with whitespace", () => {
    expect(parsePageRange(" 1 , 3 , 5 - 7 ", 10)).toEqual([0, 2, 4, 5, 6]);
  });

  it("normalises reversed ranges", () => {
    expect(parsePageRange("7-5", 10)).toEqual([4, 5, 6]);
  });

  it("de-duplicates and sorts", () => {
    expect(parsePageRange("3,1,2-3,1", 10)).toEqual([0, 1, 2]);
  });

  it("drops out-of-range and malformed parts instead of throwing", () => {
    expect(parsePageRange("0", 5)).toEqual([]);
    expect(parsePageRange("99", 5)).toEqual([]);
    expect(parsePageRange("abc", 5)).toEqual([]);
    expect(parsePageRange("2,abc,99,4", 5)).toEqual([1, 3]);
  });

  it("clips ranges to the document length", () => {
    expect(parsePageRange("3-99", 5)).toEqual([2, 3, 4]);
  });

  it("returns an empty list for empty input", () => {
    expect(parsePageRange("", 5)).toEqual([]);
    expect(parsePageRange("  ,  ", 5)).toEqual([]);
  });
});

describe("baseName", () => {
  it("strips the extension", () => {
    expect(baseName("report.pdf")).toBe("report");
    expect(baseName("my.report.final.pdf")).toBe("my.report.final");
  });

  it("leaves names without an extension untouched", () => {
    expect(baseName("report")).toBe("report");
  });

  it("keeps dotfiles intact", () => {
    expect(baseName(".gitignore")).toBe(".gitignore");
  });
});
