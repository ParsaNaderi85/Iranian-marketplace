"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import type { VendorStatus } from "@/lib/types";

export type ActionState = { error?: string } | undefined;

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    throw new Error("unauthorized");
  }
}

async function setVendorStatus(
  vendorId: string,
  status: VendorStatus,
  locale: string,
) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("vendors").update({ status }).eq("id", vendorId);
  revalidatePath(`/${locale}/admin/vendors`);
  revalidatePath(`/${locale}`);
}

export async function approveVendor(vendorId: string, locale: string) {
  await setVendorStatus(vendorId, "approved", locale);
}

export async function suspendVendor(vendorId: string, locale: string) {
  await setVendorStatus(vendorId, "suspended", locale);
}

export async function reactivateVendor(vendorId: string, locale: string) {
  await setVendorStatus(vendorId, "approved", locale);
}

export async function updateCommissionRate(
  vendorId: string,
  rate: number,
  locale: string,
) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("vendors")
    .update({ commission_rate: rate })
    .eq("id", vendorId);
  revalidatePath(`/${locale}/admin/vendors`);
}

const campaignSchema = z.object({
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  discountPercent: z.coerce.number().min(1).max(100).optional().or(z.literal("")),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  locale: z.string(),
});

export async function createCampaign(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = campaignSchema.safeParse({
    title: formData.get("title"),
    message: formData.get("message"),
    discountPercent: formData.get("discountPercent") || "",
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) return { error: "invalid" };

  const supabase = await createClient();
  const { error } = await supabase.from("campaigns").insert({
    title: parsed.data.title,
    message: parsed.data.message,
    discount_percent: parsed.data.discountPercent || null,
    starts_at: new Date(parsed.data.startsAt).toISOString(),
    ends_at: new Date(parsed.data.endsAt).toISOString(),
  });
  if (error) return { error: "invalid" };

  revalidatePath(`/${parsed.data.locale}/admin/campaigns`);
  revalidatePath(`/${parsed.data.locale}`);
  return undefined;
}

export async function markVendorPaidOut(vendorId: string, locale: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, subtotal_aed, commission_amount_aed")
    .eq("vendor_id", vendorId)
    .eq("status", "delivered")
    .eq("paid_out", false);

  if (!orders || orders.length === 0) return;

  const amountAed = orders.reduce(
    (sum, o) => sum + (o.subtotal_aed - o.commission_amount_aed),
    0,
  );

  await supabase
    .from("orders")
    .update({ paid_out: true })
    .in(
      "id",
      orders.map((o) => o.id),
    );

  await supabase.from("vendor_payouts").insert({
    vendor_id: vendorId,
    amount_aed: amountAed,
    order_count: orders.length,
  });

  revalidatePath(`/${locale}/admin/payouts`);
  revalidatePath(`/${locale}/vendor/payouts`);
}

export async function toggleCampaign(
  campaignId: string,
  active: boolean,
  locale: string,
) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("campaigns").update({ active }).eq("id", campaignId);
  revalidatePath(`/${locale}/admin/campaigns`);
  revalidatePath(`/${locale}`);
}
