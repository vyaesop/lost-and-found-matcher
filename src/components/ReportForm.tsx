"use client";

import { useActionState } from "react";
import { createReport, type CreateReportState } from "@/lib/actions";
import { CATEGORIES, COLORS, TIME_PERIODS } from "@/lib/constants";

const initialState: CreateReportState = { errors: {} };

const inputClass =
  "w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:border-neutral-900 focus:outline-none";

const labelClass =
  "mb-2 block font-mono text-[11px] uppercase tracking-widest text-neutral-500";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 font-mono text-xs text-red-600">{message}</p>;
}

export function ReportForm() {
  const [state, formAction, pending] = useActionState(createReport, initialState);
  const { errors } = state;

  return (
    <form action={formAction} className="space-y-6">
      <fieldset>
        <legend className={labelClass}>What happened?</legend>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer items-center justify-center gap-2 border border-neutral-300 px-3 py-3 text-sm font-medium has-checked:border-red-600 has-checked:text-red-600">
            <input type="radio" name="type" value="lost" defaultChecked className="accent-red-600" />
            I lost something
          </label>
          <label className="flex cursor-pointer items-center justify-center gap-2 border border-neutral-300 px-3 py-3 text-sm font-medium has-checked:border-blue-600 has-checked:text-blue-600">
            <input type="radio" name="type" value="found" className="accent-blue-600" />
            I found something
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor="title" className={labelClass}>
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

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={labelClass}>
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
          <label htmlFor="color" className={labelClass}>
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
        <label htmlFor="location" className={labelClass}>
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

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className={labelClass}>
            Date
          </label>
          <input id="date" name="date" type="date" className={inputClass} />
          <FieldError message={errors.date} />
        </div>
        <div>
          <label htmlFor="timePeriod" className={labelClass}>
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
        <label htmlFor="description" className={labelClass}>
          Description <span className="normal-case text-neutral-400">(optional, helps matching)</span>
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
        className="w-full bg-neutral-900 px-4 py-3 font-mono text-xs uppercase tracking-widest text-white hover:bg-neutral-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Submit report"}
      </button>
    </form>
  );
}
