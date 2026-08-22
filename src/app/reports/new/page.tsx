import { ReportForm } from "@/components/ReportForm";

export default function NewReportPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-4xl font-medium tracking-tight">Report an item</h1>
      <p className="mt-3 font-mono text-xs text-neutral-500">
        Fill in what you know. You will see potential matches right away.
      </p>
      <div className="mt-8 border border-neutral-200 p-6 sm:p-8">
        <ReportForm />
      </div>
    </div>
  );
}
