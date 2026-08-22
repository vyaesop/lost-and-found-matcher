import { ReportForm } from "@/components/ReportForm";

export default function NewReportPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">Report an item</h1>
      <p className="mt-1 text-sm text-slate-600">
        Fill in what you know. You will see potential matches right away.
      </p>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <ReportForm />
      </div>
    </div>
  );
}
