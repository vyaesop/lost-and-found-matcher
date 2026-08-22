import { z } from "zod";
import { CATEGORIES, COLORS, REPORT_TYPES, TIME_PERIODS } from "./constants";

export const reportSchema = z.object({
  type: z.enum(REPORT_TYPES),
  title: z.string().trim().min(1, "Title is required").max(80, "Keep the title under 80 characters"),
  category: z.enum(CATEGORIES),
  description: z.string().trim().max(500, "Keep the description under 500 characters"),
  color: z.enum(COLORS),
  location: z.string().trim().min(1, "Location is required").max(80, "Keep the location under 80 characters"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date is required")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid date")
    // 24h grace so today is accepted in every timezone
    .refine(
      (value) => new Date(value).getTime() <= Date.now() + 86_400_000,
      "Date cannot be in the future",
    ),
  timePeriod: z.enum(TIME_PERIODS),
});

export type ReportInput = z.infer<typeof reportSchema>;

export type FieldErrors = Partial<Record<keyof ReportInput, string>>;

export function validateReport(data: Record<string, unknown>):
  | { ok: true; value: ReportInput }
  | { ok: false; errors: FieldErrors } {
  const result = reportSchema.safeParse(data);
  if (result.success) return { ok: true, value: result.data };

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ReportInput;
    if (!errors[field]) errors[field] = issue.message;
  }
  return { ok: false, errors };
}
