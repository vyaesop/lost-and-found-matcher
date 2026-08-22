import Link from "next/link";
import type { Report } from "@prisma/client";
import { formatReportDate } from "@/lib/format";
import { ColorDot } from "./ColorDot";

const TYPE_STYLES: Record<string, string> = {
  lost: "bg-rose-100 text-rose-800",
  found: "bg-sky-100 text-sky-800",
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
      className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${TYPE_STYLES[report.type] ?? "bg-slate-100 text-slate-700"}`}
        >
          {report.type}
        </span>
        {bestScore !== undefined && (
          <span className="text-xs font-medium text-emerald-700">
            Best match {bestScore}%
          </span>
        )}
      </div>
      <h3 className="mt-2 font-semibold text-slate-900">{report.title}</h3>
      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
        <span className="capitalize">{report.category}</span>
        <span className="inline-flex items-center gap-1.5 capitalize">
          <ColorDot color={report.color} /> {report.color}
        </span>
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {report.location} &middot; {formatReportDate(report.date, report.timePeriod)}
      </p>
    </Link>
  );
}
