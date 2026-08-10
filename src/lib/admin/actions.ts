"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import type { VendorStatus } from "@/lib/types";

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
