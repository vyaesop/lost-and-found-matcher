import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { findMatches } from "@/lib/matching/score";
import { formatReportDate } from "@/lib/format";
import { ColorDot } from "@/components/ColorDot";
import { ScoreBadge } from "@/components/ScoreBadge";

export const dynamic = "force-dynamic";

const TYPE_STYLES: Record<string, string> = {
  lost: "bg-rose-100 text-rose-800",
  found: "bg-sky-100 text-sky-800",
};

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) notFound();

  const candidates = await prisma.report.findMany({
    where: { type: report.type === "lost" ? "found" : "lost" },
  });
  const matches = findMatches(report, candidates);

  return (
    <div className="space-y-8">
      <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
        &larr; All reports
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${TYPE_STYLES[report.type] ?? "bg-slate-100 text-slate-700"}`}
        >
          {report.type}
        </span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{report.title}</h1>
        {report.description && (
          <p className="mt-2 text-slate-700">{report.description}</p>
        )}
        <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500">Category</dt>
            <dd className="capitalize">{report.category}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Color</dt>
            <dd className="flex items-center gap-1.5 capitalize">
              <ColorDot color={report.color} /> {report.color}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Location</dt>
            <dd>{report.location}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">When</dt>
            <dd>{formatReportDate(report.date, report.timePeriod)}</dd>
          </div>
        </dl>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          Potential matches {matches.length > 0 && `(${matches.length})`}
        </h2>
        {matches.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            No likely matches yet. This page checks all {report.type === "lost" ? "found" : "lost"} reports
            automatically, so check back later.
          </p>
        ) : (
          <div className="space-y-4">
            {matches.map(({ report: other, score, label, reasons }) => (
              <div
                key={other.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/reports/${other.id}`}
                      className="font-semibold text-slate-900 hover:underline"
                    >
                      {other.title}
                    </Link>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {other.location} &middot; {formatReportDate(other.date, other.timePeriod)}
                    </p>
                  </div>
                  <ScoreBadge score={score} label={label} />
                </div>
                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  {reasons.map((reason) => (
                    <li key={reason} className="flex gap-2">
                      <span className="text-slate-400">&bull;</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
