import { describe, expect, it } from "vitest";
import { normalizeText, tokenize } from "./normalize";

describe("normalizeText", () => {
  it("lowercases and strips punctuation", () => {
    expect(normalizeText("Black AirPods-Case!!")).toBe("black airpods case");
  });

  it("collapses repeated separators", () => {
    expect(normalizeText("  red,,  scarf ")).toBe("red scarf");
  });
});

describe("tokenize", () => {
  it("drops stopwords", () => {
    expect(tokenize("I lost my wallet near the cafeteria")).toEqual([
      "wallet",
      "cafeteria",
    ]);
  });

  it("maps synonyms to a canonical token", () => {
    expect(tokenize("airpods")).toEqual(["earbuds"]);
    expect(tokenize("rucksack")).toEqual(["backpack"]);
    expect(tokenize("dark")).toEqual(["black"]);
  });

  it("singularizes simple plurals", () => {
    expect(tokenize("chargers")).toEqual(["charger"]);
    expect(tokenize("umbrellas")).toEqual(["umbrella"]);
  });

  it("dedupes repeated words", () => {
    expect(tokenize("keys keys keychain")).toEqual(["key"]);
  });

  it("returns an empty list for empty or stopword-only input", () => {
    expect(tokenize("")).toEqual([]);
    expect(tokenize("i lost it near the")).toEqual([]);
  });
});
