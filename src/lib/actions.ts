"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { validateReport, type FieldErrors } from "./validation";

export interface CreateReportState {
  errors: FieldErrors;
}

export async function createReport(
  _prev: CreateReportState,
  formData: FormData,
): Promise<CreateReportState> {
  const result = validateReport({
    type: formData.get("type"),
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description") ?? "",
    color: formData.get("color"),
    location: formData.get("location"),
    date: formData.get("date"),
    timePeriod: formData.get("timePeriod"),
  });

  if (!result.ok) return { errors: result.errors };

  const report = await prisma.report.create({
    data: { ...result.value, date: new Date(result.value.date) },
  });

  revalidatePath("/");
  redirect(`/reports/${report.id}`);
}
