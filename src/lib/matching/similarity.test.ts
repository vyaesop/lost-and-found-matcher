import { describe, expect, it } from "vitest";
import { levenshtein, tokensMatch, tokenSetSimilarity } from "./similarity";

describe("levenshtein", () => {
  it("is zero for identical strings", () => {
    expect(levenshtein("wallet", "wallet")).toBe(0);
  });

  it("handles empty strings", () => {
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("abc", "")).toBe(3);
  });

  it("computes classic distances", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
    expect(levenshtein("charger", "chargr")).toBe(1);
  });
});

describe("tokensMatch", () => {
  it("matches exact tokens", () => {
    expect(tokensMatch("bag", "bag")).toBe(true);
  });

  it("tolerates one typo in longer words", () => {
    expect(tokensMatch("charger", "chargr")).toBe(true);
    expect(tokensMatch("umbrella", "umbrela")).toBe(true);
  });

  it("does not fuzz short words", () => {
    expect(tokensMatch("bag", "bat")).toBe(false);
    expect(tokensMatch("key", "keg")).toBe(false);
  });
});

describe("tokenSetSimilarity", () => {
  it("is 1 for identical sets", () => {
    expect(tokenSetSimilarity(["black", "wallet"], ["black", "wallet"])).toBe(1);
  });

  it("is 0 for disjoint sets", () => {
    expect(tokenSetSimilarity(["red", "scarf"], ["silver", "laptop"])).toBe(0);
  });

  it("is 0 when either set is empty", () => {
    expect(tokenSetSimilarity([], ["wallet"])).toBe(0);
  });

  it("scores partial overlap", () => {
    expect(tokenSetSimilarity(["black", "wallet"], ["black", "purse"])).toBe(0.5);
  });

  it("counts fuzzy matches in the overlap", () => {
    expect(tokenSetSimilarity(["charger"], ["chargr"])).toBe(1);
  });
});
