"use client";

import { useActionState } from "react";
import { createReport, type CreateReportState } from "@/lib/actions";
import { CATEGORIES, COLORS, TIME_PERIODS } from "@/lib/constants";

const initialState: CreateReportState = { errors: {} };

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-rose-600">{message}</p>;
}

export function ReportForm() {
  const [state, formAction, pending] = useActionState(createReport, initialState);
  const { errors } = state;

  return (
    <form action={formAction} className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">
          What happened?
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium has-checked:border-rose-400 has-checked:bg-rose-50">
            <input type="radio" name="type" value="lost" defaultChecked className="accent-rose-600" />
            I lost something
          </label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium has-checked:border-sky-400 has-checked:bg-sky-50">
            <input type="radio" name="type" value="found" className="accent-sky-600" />
            I found something
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="e.g. Black AirPods case"
          className={inputClass}
        />
        <FieldError message={errors.title} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
            Category
          </label>
          <select id="category" name="category" className={`${inputClass} capitalize`}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <FieldError message={errors.category} />
        </div>
        <div>
          <label htmlFor="color" className="mb-1 block text-sm font-medium text-slate-700">
            Main color
          </label>
          <select id="color" name="color" className={`${inputClass} capitalize`}>
            {COLORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <FieldError message={errors.color} />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="mb-1 block text-sm font-medium text-slate-700">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          placeholder="e.g. Main library, second floor"
          className={inputClass}
        />
        <FieldError message={errors.location} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="mb-1 block text-sm font-medium text-slate-700">
            Date
          </label>
          <input id="date" name="date" type="date" className={inputClass} />
          <FieldError message={errors.date} />
        </div>
        <div>
          <label htmlFor="timePeriod" className="mb-1 block text-sm font-medium text-slate-700">
            Time of day
          </label>
          <select
            id="timePeriod"
            name="timePeriod"
            defaultValue="unknown"
            className={`${inputClass} capitalize`}
          >
            {TIME_PERIODS.map((t) => (
              <option key={t} value={t}>
                {t === "unknown" ? "not sure" : t}
              </option>
            ))}
          </select>
          <FieldError message={errors.timePeriod} />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
          Description <span className="font-normal text-slate-500">(optional, helps matching)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Any details: brand, stickers, contents, where exactly..."
          className={inputClass}
        />
        <FieldError message={errors.description} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Submit report"}
      </button>
    </form>
  );
}
