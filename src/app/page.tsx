import Link from "next/link";
import type { Report } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { findMatches } from "@/lib/matching/score";
import { ReportCard } from "@/components/ReportCard";

export const dynamic = "force-dynamic";

function Column({
  heading,
  reports,
  bestScores,
  emptyText,
}: {
  heading: string;
  reports: Report[];
  bestScores: Map<string, number>;
  emptyText: string;
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {heading} ({reports.length})
      </h2>
      {reports.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
          {emptyText}
        </p>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              bestScore={bestScores.get(report.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function HomePage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
  });

  const bestScores = new Map<string, number>();
  for (const report of reports) {
    const [top] = findMatches(report, reports);
    if (top) bestScores.set(report.id, top.score);
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <h1 className="text-xl font-semibold">No reports yet</h1>
        <p className="mt-2 text-sm text-slate-600">
          File the first lost or found report and matches will show up here.
        </p>
        <Link
          href="/reports/new"
          className="mt-5 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Report an item
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-slate-600">
          Open any report to see its potential matches, scored and explained.
        </p>
      </div>
      <div className="grid gap-8 sm:grid-cols-2">
        <Column
          heading="Lost"
          reports={reports.filter((r) => r.type === "lost")}
          bestScores={bestScores}
          emptyText="No lost item reports yet."
        />
        <Column
          heading="Found"
          reports={reports.filter((r) => r.type === "found")}
          bestScores={bestScores}
          emptyText="No found item reports yet."
        />
      </div>
    </>
  );
}
