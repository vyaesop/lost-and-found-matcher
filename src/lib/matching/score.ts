import { tokenize, normalizeText } from "./normalize";
import { tokenSetSimilarity } from "./similarity";

export interface MatchableReport {
  id: string;
  type: string;
  title: string;
  category: string;
  description: string;
  color: string;
  location: string;
  date: Date;
  timePeriod: string;
}

export interface MatchResult {
  report: MatchableReport;
  score: number;
  label: MatchLabel;
  reasons: string[];
}

export type MatchLabel = "strong" | "possible" | "weak";

export const WEIGHTS = {
  category: 30,
  text: 25,
  location: 20,
  date: 15,
  color: 10,
} as const;

export const MIN_SCORE = 30;
export const POSSIBLE_THRESHOLD = 50;
export const STRONG_THRESHOLD = 75;

// A category mismatch caps the total so unrelated items never look strong.
const CATEGORY_MISMATCH_CAP = 45;

// Rough midpoint hour for each time period, used for date proximity.
const PERIOD_HOURS: Record<string, number> = {
  morning: 9,
  afternoon: 14,
  evening: 19,
  night: 22,
  unknown: 12,
};

// Date proximity decays linearly to zero over two weeks.
const MAX_HOURS_APART = 14 * 24;

// Colors that are easy to confuse with each other, scored 0 to 1.
const COLOR_AFFINITY: Record<string, number> = {
  "black|gray": 0.6,
  "black|navy": 0.5,
  "black|brown": 0.4,
  "gray|silver": 0.7,
  "gray|white": 0.4,
  "silver|white": 0.6,
  "beige|white": 0.6,
  "beige|brown": 0.7,
  "orange|red": 0.5,
  "pink|red": 0.6,
  "orange|yellow": 0.6,
  "gold|yellow": 0.7,
  "pink|purple": 0.6,
};

function colorAffinity(a: string, b: string): number {
  const key = [a, b].sort().join("|");
  return COLOR_AFFINITY[key] ?? 0;
}

interface Component {
  score: number;
  reason: string;
}

function scoreCategory(a: MatchableReport, b: MatchableReport): Component {
  if (a.category !== b.category) {
    return {
      score: 0,
      reason: `Different categories (${a.category} vs ${b.category})`,
    };
  }
  if (a.category === "other") {
    return { score: 0.5, reason: 'Both filed under "other", weak signal' };
  }
  return { score: 1, reason: `Same category (${a.category})` };
}

function scoreText(a: MatchableReport, b: MatchableReport): Component {
  const tokensA = tokenize(`${a.title} ${a.description}`);
  const tokensB = tokenize(`${b.title} ${b.description}`);
  if (tokensA.length === 0 || tokensB.length === 0) {
    return { score: 0, reason: "Not enough description to compare" };
  }
  const score = tokenSetSimilarity(tokensA, tokensB);
  if (score >= 0.8) return { score, reason: "Descriptions are highly similar" };
  if (score >= 0.45) return { score, reason: "Descriptions share several details" };
  if (score > 0) return { score, reason: "Descriptions share a few words" };
  return { score, reason: "Descriptions have little in common" };
}

function scoreLocation(a: MatchableReport, b: MatchableReport): Component {
  const normA = normalizeText(a.location);
  const normB = normalizeText(b.location);
  if (normA.length > 0 && normA === normB) {
    return { score: 1, reason: `Same location (${a.location})` };
  }
  const score = tokenSetSimilarity(tokenize(a.location), tokenize(b.location));
  if (score >= 0.95) return { score, reason: "Same location" };
  if (score >= 0.45) return { score, reason: "Locations appear to be the same area" };
  if (score > 0) return { score, reason: "Locations partially overlap" };
  return { score, reason: "Different locations" };
}

function approximateTime(report: MatchableReport): number {
  const hour = PERIOD_HOURS[report.timePeriod] ?? 12;
  return report.date.getTime() + hour * 3_600_000;
}

function scoreDate(lost: MatchableReport, found: MatchableReport): Component {
  const lostTime = approximateTime(lost);
  const foundTime = approximateTime(found);
  const hoursApart = Math.abs(foundTime - lostTime) / 3_600_000;

  const score = Math.max(0, 1 - hoursApart / MAX_HOURS_APART);
  const daysApart = Math.round(hoursApart / 24);

  // Finding an item well before it was lost points away from a match.
  if (foundTime < lostTime - 24 * 3_600_000) {
    return {
      score: score * 0.5,
      reason: `Item was found ${daysApart} day${daysApart === 1 ? "" : "s"} before it was reported lost`,
    };
  }
  if (hoursApart <= 12) {
    return { score, reason: "Reports occurred within several hours of each other" };
  }
  if (hoursApart <= 36) {
    return { score, reason: "Reports are about a day apart" };
  }
  if (score > 0) {
    return { score, reason: `Reports are ${daysApart} days apart` };
  }
  return { score: 0, reason: "Reports are more than two weeks apart" };
}

function scoreColor(a: MatchableReport, b: MatchableReport): Component {
  if (a.color === "unknown" && b.color === "unknown") {
    return { score: 0.5, reason: "Color not specified on either report" };
  }
  if (a.color === "unknown" || b.color === "unknown") {
    return { score: 0.5, reason: "Color not specified on one of the reports" };
  }
  if (a.color === b.color) {
    if (a.color === "multicolor") {
      return { score: 1, reason: "Both items are multicolored" };
    }
    return { score: 1, reason: `Same color (${a.color})` };
  }
  if (a.color === "multicolor" || b.color === "multicolor") {
    return { score: 0.3, reason: "One item is multicolored, hard to compare" };
  }
  const affinity = colorAffinity(a.color, b.color);
  if (affinity > 0) {
    return { score: affinity, reason: `Similar colors (${a.color} and ${b.color})` };
  }
  return { score: 0, reason: `Different colors (${a.color} vs ${b.color})` };
}

export function labelFor(score: number): MatchLabel {
  if (score >= STRONG_THRESHOLD) return "strong";
  if (score >= POSSIBLE_THRESHOLD) return "possible";
  return "weak";
}

export function scoreMatch(a: MatchableReport, b: MatchableReport): Omit<MatchResult, "report"> {
  if (a.type === b.type) {
    throw new Error("Can only match a lost report against a found report");
  }
  const lost = a.type === "lost" ? a : b;
  const found = a.type === "lost" ? b : a;

  const category = scoreCategory(lost, found);
  const text = scoreText(lost, found);
  const location = scoreLocation(lost, found);
  const date = scoreDate(lost, found);
  const color = scoreColor(lost, found);

  let score = Math.round(
    category.score * WEIGHTS.category +
      text.score * WEIGHTS.text +
      location.score * WEIGHTS.location +
      date.score * WEIGHTS.date +
      color.score * WEIGHTS.color,
  );
  if (category.score === 0) {
    score = Math.min(score, CATEGORY_MISMATCH_CAP);
  }

  return {
    score,
    label: labelFor(score),
    reasons: [category, text, location, date, color].map((c) => c.reason),
  };
}

export function findMatches(
  report: MatchableReport,
  candidates: MatchableReport[],
): MatchResult[] {
  return candidates
    .filter((c) => c.type !== report.type && c.id !== report.id)
    .map((candidate) => ({ report: candidate, ...scoreMatch(report, candidate) }))
    .filter((result) => result.score >= MIN_SCORE)
    .sort((x, y) => y.score - x.score);
}
