// Dates are stored as UTC midnight, so format them in UTC to avoid drift.
export function formatReportDate(date: Date, timePeriod: string): string {
  const day = date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return timePeriod === "unknown" ? day : `${day}, ${timePeriod}`;
}
