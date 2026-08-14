"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { VENDOR_TYPES, type VendorApplicationStatus } from "@/lib/types";
import { checkRateLimit, getServerActionIp } from "@/lib/rate-limit";

const APPLICATION_RATE_LIMIT = 3;
const APPLICATION_RATE_WINDOW_MS = 10 * 60_000;

export type ActionState = { error?: string; success?: boolean } | undefined;

const applicationSchema = z.object({
  businessName: z.string().min(2),
  businessType: z.enum(VENDOR_TYPES as [string, ...string[]]),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  area: z.string().optional(),
  message: z.string().optional(),
});

export async function submitVendorApplication(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ip = await getServerActionIp();
  const rateLimit = checkRateLimit(
    `vendor-application:${ip}`,
    APPLICATION_RATE_LIMIT,
    APPLICATION_RATE_WINDOW_MS,
  );
  if (!rateLimit.allowed) return { error: "rateLimited" };

  const parsed = applicationSchema.safeParse({
    businessName: formData.get("businessName"),
    businessType: formData.get("businessType"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone") || undefined,
    area: formData.get("area") || undefined,
    message: formData.get("message") || undefined,
  });
  if (!parsed.success) return { error: "invalid" };

  const supabase = await createClient();
  const { error } = await supabase.from("vendor_applications").insert({
    business_name: parsed.data.businessName,
    business_type: parsed.data.businessType,
    contact_name: parsed.data.contactName,
    contact_email: parsed.data.contactEmail,
    contact_phone: parsed.data.contactPhone ?? null,
    area: parsed.data.area ?? null,
    message: parsed.data.message ?? null,
  });
  if (error) return { error: "submitFailed" };

  return { success: true };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: VendorApplicationStatus,
  locale: string,
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") return;

  const supabase = await createClient();
  await supabase
    .from("vendor_applications")
    .update({ status })
    .eq("id", applicationId);
  revalidatePath(`/${locale}/admin/applications`);
}
