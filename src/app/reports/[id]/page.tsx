import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { findMatches } from "@/lib/matching/score";
import { formatReportDate } from "@/lib/format";
import { ColorDot } from "@/components/ColorDot";
import { ScoreBadge } from "@/components/ScoreBadge";

export const dynamic = "force-dynamic";

const TYPE_STYLES: Record<string, string> = {
  lost: "text-red-600",
  found: "text-blue-600",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-neutral-200 p-5">
      <dt className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm text-neutral-900">{children}</dd>
    </div>
  );
}

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
    <div className="space-y-12">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-900"
      >
        &larr; All reports
      </Link>

      <div className="border border-neutral-200">
        <div className="p-6">
          <span
            className={`font-mono text-[11px] uppercase tracking-widest ${TYPE_STYLES[report.type] ?? "text-neutral-500"}`}
          >
            {report.type}
          </span>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">{report.title}</h1>
          {report.description && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
              {report.description}
            </p>
          )}
        </div>
        <dl className="grid sm:grid-cols-2 sm:[&>*:nth-child(even)]:border-l sm:[&>*:nth-child(even)]:border-neutral-200">
          <Field label="Category">
            <span className="capitalize">{report.category}</span>
          </Field>
          <Field label="Color">
            <span className="inline-flex items-center gap-2 capitalize">
              <ColorDot color={report.color} /> {report.color}
            </span>
          </Field>
          <Field label="Location">{report.location}</Field>
          <Field label="When">{formatReportDate(report.date, report.timePeriod)}</Field>
        </dl>
      </div>

      <section>
        <h2 className="border-b border-neutral-900 pb-2 font-mono text-xs font-semibold uppercase tracking-[0.2em]">
          Potential matches ({matches.length})
        </h2>
        {matches.length === 0 ? (
          <p className="border border-t-0 border-dashed border-neutral-300 p-6 font-mono text-xs text-neutral-500">
            No likely matches yet. This page checks all{" "}
            {report.type === "lost" ? "found" : "lost"} reports automatically, so
            check back later.
          </p>
        ) : (
          <div className="divide-y divide-neutral-200 border-x border-b border-neutral-200">
            {matches.map(({ report: other, score, label, reasons }) => (
              <div key={other.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/reports/${other.id}`}
                      className="text-lg font-medium tracking-tight text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900"
                    >
                      {other.title}
                    </Link>
                    <p className="mt-1.5 font-mono text-xs text-neutral-500">
                      {other.location} &middot;{" "}
                      {formatReportDate(other.date, other.timePeriod)}
                    </p>
                  </div>
                  <ScoreBadge score={score} label={label} />
                </div>
                <ol className="mt-5 space-y-1.5">
                  {reasons.map((reason, i) => (
                    <li key={reason} className="flex gap-3 text-sm text-neutral-600">
                      <span className="font-mono text-xs leading-5 text-neutral-400">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {reason}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
