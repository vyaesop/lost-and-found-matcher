export const REPORT_TYPES = ["lost", "found"] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const CATEGORIES = [
  "electronics",
  "bags",
  "clothing",
  "accessories",
  "wallets",
  "keys",
  "documents",
  "eyewear",
  "books",
  "sports gear",
  "other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const COLORS = [
  "black",
  "white",
  "gray",
  "silver",
  "brown",
  "beige",
  "red",
  "orange",
  "yellow",
  "gold",
  "green",
  "blue",
  "navy",
  "purple",
  "pink",
  "multicolor",
  "unknown",
] as const;
export type Color = (typeof COLORS)[number];

export const TIME_PERIODS = [
  "morning",
  "afternoon",
  "evening",
  "night",
  "unknown",
] as const;
export type TimePeriod = (typeof TIME_PERIODS)[number];
