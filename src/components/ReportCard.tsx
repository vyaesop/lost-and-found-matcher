import Link from "next/link";
import type { Report } from "@prisma/client";
import { formatReportDate } from "@/lib/format";
import { ColorDot } from "./ColorDot";

const TYPE_STYLES: Record<string, string> = {
  lost: "text-red-600",
  found: "text-blue-600",
};

export function ReportCard({
  report,
  bestScore,
}: {
  report: Report;
  bestScore?: number;
}) {
  return (
    <Link
      href={`/reports/${report.id}`}
      className="block p-5 transition-colors hover:bg-neutral-50"
    >
      <div className="flex items-baseline justify-between gap-2 font-mono text-[11px] uppercase tracking-widest">
        <span className={TYPE_STYLES[report.type] ?? "text-neutral-500"}>
          {report.type}
        </span>
        {bestScore !== undefined && (
          <span className="text-neutral-900">Best match {bestScore}%</span>
        )}
      </div>
      <h3 className="mt-2 text-lg font-medium tracking-tight text-neutral-900">
        {report.title}
      </h3>
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-neutral-500">
        <span className="capitalize">{report.category}</span>
        <span className="inline-flex items-center gap-1.5 capitalize">
          <ColorDot color={report.color} /> {report.color}
        </span>
      </p>
      <p className="mt-1 font-mono text-xs text-neutral-500">
        {report.location} &middot; {formatReportDate(report.date, report.timePeriod)}
      </p>
    </Link>
  );
}
