import type { MatchLabel } from "@/lib/matching/score";

const STYLES: Record<MatchLabel, string> = {
  strong: "border-emerald-600 text-emerald-700",
  possible: "border-amber-500 text-amber-700",
  weak: "border-neutral-300 text-neutral-500",
};

const LABELS: Record<MatchLabel, string> = {
  strong: "Strong match",
  possible: "Possible match",
  weak: "Weak match",
};

export function ScoreBadge({ score, label }: { score: number; label: MatchLabel }) {
  return (
    <span
      className={`inline-flex items-baseline gap-2 border px-3 py-1.5 font-mono text-xs uppercase tracking-wider ${STYLES[label]}`}
    >
      <span className="text-sm font-semibold">{score}%</span>
      {LABELS[label]}
    </span>
  );
}
