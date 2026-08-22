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
      <h2 className="border-b border-neutral-900 pb-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900">
        {heading} ({reports.length})
      </h2>
      {reports.length === 0 ? (
        <p className="border border-t-0 border-dashed border-neutral-300 p-5 font-mono text-xs text-neutral-500">
          {emptyText}
        </p>
      ) : (
        <div className="divide-y divide-neutral-200 border-x border-b border-neutral-200">
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
      <div className="border border-neutral-200 p-16 text-center">
        <h1 className="text-2xl font-medium tracking-tight">No reports yet</h1>
        <p className="mt-3 font-mono text-xs text-neutral-500">
          File the first lost or found report and matches will show up here.
        </p>
        <Link
          href="/reports/new"
          className="mt-8 inline-block bg-neutral-900 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-white hover:bg-neutral-700"
        >
          Report an item
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-medium tracking-tight">Reports</h1>
        <p className="mt-3 font-mono text-xs text-neutral-500">
          Open any report to see its potential matches, scored and explained.
        </p>
      </div>
      <div className="grid gap-10 sm:grid-cols-2 sm:gap-8">
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
