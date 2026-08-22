import type { MatchLabel } from "@/lib/matching/score";

const STYLES: Record<MatchLabel, string> = {
  strong: "bg-emerald-100 text-emerald-800",
  possible: "bg-amber-100 text-amber-800",
  weak: "bg-slate-200 text-slate-700",
};

const LABELS: Record<MatchLabel, string> = {
  strong: "Strong match",
  possible: "Possible match",
  weak: "Weak match",
};

export function ScoreBadge({ score, label }: { score: number; label: MatchLabel }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${STYLES[label]}`}
    >
      {score}% <span className="font-normal">{LABELS[label]}</span>
    </span>
  );
}
