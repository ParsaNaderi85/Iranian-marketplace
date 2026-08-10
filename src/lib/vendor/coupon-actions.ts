"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getVendorByOwnerId } from "@/lib/data/vendors";

export type ActionState = { error?: string } | undefined;

const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  discountPercent: z.coerce.number().min(1).max(100),
  locale: z.string(),
});

export async function createVendorCoupon(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauthorized" };

  const vendor = await getVendorByOwnerId(user.id);
  if (!vendor) return { error: "noVendor" };

  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    discountPercent: formData.get("discountPercent"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) return { error: "invalid" };

  const supabase = await createClient();
  const { error } = await supabase.from("vendor_coupons").insert({
    vendor_id: vendor.id,
    code: parsed.data.code,
    discount_percent: parsed.data.discountPercent,
  });
  if (error) {
    return { error: error.code === "23505" ? "codeTaken" : "invalid" };
  }

  revalidatePath(`/${parsed.data.locale}/vendor/coupons`);
  return undefined;
}

export async function validateVendorCoupon(
  code: string,
  vendorId: string,
): Promise<{ discountPercent: number } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vendor_coupons")
    .select("discount_percent")
    .eq("vendor_id", vendorId)
    .eq("code", code.toUpperCase())
    .eq("active", true)
    .maybeSingle();

  return data ? { discountPercent: data.discount_percent } : null;
}

export async function toggleVendorCoupon(
  couponId: string,
  active: boolean,
  locale: string,
) {
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase.from("vendor_coupons").update({ active }).eq("id", couponId);
  revalidatePath(`/${locale}/vendor/coupons`);
}
