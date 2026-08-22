import { describe, expect, it } from "vitest";
import {
  findMatches,
  MIN_SCORE,
  scoreMatch,
  STRONG_THRESHOLD,
  type MatchableReport,
} from "./score";

let counter = 0;

function report(overrides: Partial<MatchableReport>): MatchableReport {
  return {
    id: `r${counter++}`,
    type: "lost",
    title: "Item",
    category: "other",
    description: "",
    color: "unknown",
    location: "",
    date: new Date("2026-08-17"),
    timePeriod: "unknown",
    ...overrides,
  };
}

const lostAirpods = report({
  type: "lost",
  title: "Black AirPods case",
  category: "electronics",
  description: "I lost my black AirPods case near the cafeteria",
  color: "black",
  location: "cafeteria",
  date: new Date("2026-08-17"),
  timePeriod: "afternoon",
});

const foundEarbuds = report({
  type: "found",
  title: "Wireless earbud case",
  category: "electronics",
  description: "Found a dark wireless earbud case beside the coffee shop",
  color: "black",
  location: "coffee shop",
  date: new Date("2026-08-17"),
  timePeriod: "evening",
});

describe("scoreMatch", () => {
  it("rates the assessment's example scenario as a strong match", () => {
    const result = scoreMatch(lostAirpods, foundEarbuds);
    expect(result.score).toBeGreaterThanOrEqual(STRONG_THRESHOLD);
    expect(result.label).toBe("strong");
    expect(result.reasons).toContain("Same category (electronics)");
    expect(result.reasons).toContain("Descriptions are highly similar");
  });

  it("rates the two-weeks-later backpack as ambiguous, not strong", () => {
    const lost = report({
      type: "lost",
      title: "Black backpack",
      category: "bags",
      description: "Black backpack containing a laptop charger",
      color: "black",
      location: "library",
      date: new Date("2026-08-03"),
      timePeriod: "afternoon",
    });
    const found = report({
      type: "found",
      title: "Black backpack",
      category: "bags",
      description: "Black backpack found at the football field",
      color: "black",
      location: "football field",
      date: new Date("2026-08-17"),
      timePeriod: "evening",
    });
    const result = scoreMatch(lost, found);
    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(result.score).toBeLessThan(STRONG_THRESHOLD);
  });

  it("scores unrelated items below the display threshold", () => {
    const lost = report({
      type: "lost",
      title: "Red jacket",
      category: "clothing",
      description: "Red rain jacket with a hood",
      color: "red",
      location: "gym",
      date: new Date("2026-08-15"),
    });
    const found = report({
      type: "found",
      title: "Silver laptop",
      category: "electronics",
      description: "Silver laptop left on a desk",
      color: "silver",
      location: "lecture hall 2",
      date: new Date("2026-08-17"),
    });
    expect(scoreMatch(lost, found).score).toBeLessThan(MIN_SCORE);
  });

  it("caps the score when categories differ", () => {
    const lost = report({
      type: "lost",
      title: "Red umbrella",
      category: "other",
      description: "Red umbrella",
      color: "red",
      location: "main library",
      date: new Date("2026-08-17"),
      timePeriod: "morning",
    });
    const found = report({
      type: "found",
      title: "Red backpack",
      category: "bags",
      description: "Red backpack",
      color: "red",
      location: "main library",
      date: new Date("2026-08-17"),
      timePeriod: "morning",
    });
    const result = scoreMatch(lost, found);
    expect(result.score).toBeLessThanOrEqual(45);
    expect(result.label).not.toBe("strong");
    expect(result.reasons).toContain("Different categories (other vs bags)");
  });

  it("penalizes items found well before they were reported lost", () => {
    const lost = report({
      type: "lost",
      title: "Blue water bottle",
      category: "other",
      description: "Blue steel water bottle",
      color: "blue",
      location: "gym",
      date: new Date("2026-08-17"),
    });
    const foundAfter = report({
      type: "found",
      title: "Blue water bottle",
      category: "other",
      description: "Blue steel water bottle",
      color: "blue",
      location: "gym",
      date: new Date("2026-08-20"),
    });
    const foundBefore = report({ ...foundAfter, date: new Date("2026-08-14") });

    const after = scoreMatch(lost, foundAfter);
    const before = scoreMatch(lost, foundBefore);
    expect(before.score).toBeLessThan(after.score);
    expect(before.reasons.join(" ")).toContain("before it was reported lost");
  });

  it("is symmetric regardless of argument order", () => {
    const a = scoreMatch(lostAirpods, foundEarbuds);
    const b = scoreMatch(foundEarbuds, lostAirpods);
    expect(a.score).toBe(b.score);
    expect(a.reasons).toEqual(b.reasons);
  });

  it("throws when both reports have the same type", () => {
    expect(() => scoreMatch(lostAirpods, lostAirpods)).toThrow();
  });

  it("survives missing descriptions by falling back to titles", () => {
    const lost = report({
      type: "lost",
      title: "Brown leather wallet",
      category: "wallets",
      color: "brown",
      location: "student center",
      date: new Date("2026-08-17"),
    });
    const found = report({
      type: "found",
      title: "Brown wallet",
      category: "wallets",
      color: "brown",
      location: "student center",
      date: new Date("2026-08-17"),
    });
    const result = scoreMatch(lost, found);
    expect(result.score).toBeGreaterThanOrEqual(STRONG_THRESHOLD);
  });

  it("treats unknown color as uncertainty, not disagreement", () => {
    const lost = report({ type: "lost", color: "unknown", category: "keys" });
    const found = report({ type: "found", color: "black", category: "keys" });
    const result = scoreMatch(lost, found);
    expect(result.reasons).toContain("Color not specified on one of the reports");
  });

  it("does not treat two unknown colors as a color agreement", () => {
    const lost = report({ type: "lost", color: "unknown", category: "keys" });
    const found = report({ type: "found", color: "unknown", category: "keys" });
    const result = scoreMatch(lost, found);
    expect(result.reasons).toContain("Color not specified on either report");
  });
});

describe("findMatches", () => {
  it("only compares reports of the opposite type", () => {
    const otherLost = report({ type: "lost", title: "Black AirPods case" });
    const matches = findMatches(lostAirpods, [otherLost, foundEarbuds]);
    expect(matches).toHaveLength(1);
    expect(matches[0].report.id).toBe(foundEarbuds.id);
  });

  it("filters out low scores and sorts by score descending", () => {
    const weakFound = report({
      type: "found",
      title: "Green scarf",
      category: "clothing",
      description: "Knitted green scarf",
      color: "green",
      location: "bus stop",
      date: new Date("2026-06-01"),
    });
    const matches = findMatches(lostAirpods, [weakFound, foundEarbuds]);
    expect(matches.map((m) => m.report.id)).toEqual([foundEarbuds.id]);
  });

  it("returns an empty list when there are no candidates", () => {
    expect(findMatches(lostAirpods, [])).toEqual([]);
  });
});
