"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import type { Coupon } from "@/lib/types";

const REFERRAL_REWARD_PERCENT = 20;

function randomCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 confusion
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function getOrCreateReferralCode(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", user.id)
    .single();

  if (profile?.referral_code) return profile.referral_code;

  const service = await createServiceRoleClient();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { error } = await service
      .from("profiles")
      .update({ referral_code: code })
      .eq("id", user.id)
      .is("referral_code", null);
    if (!error) return code;
  }
  return null;
}

export async function applyReferralCodeIfPresent(
  userId: string,
  refCode: string | null | undefined,
) {
  if (!refCode) return;
  const service = await createServiceRoleClient();

  const { data: referrer } = await service
    .from("profiles")
    .select("id")
    .eq("referral_code", refCode.toUpperCase())
    .maybeSingle();
  if (!referrer || referrer.id === userId) return;

  await service
    .from("profiles")
    .update({ referred_by: referrer.id })
    .eq("id", userId)
    .is("referred_by", null);
}

// Called after a customer's order is successfully placed. If this was their
// first order and they were referred by someone, the referrer earns a
// one-time 20%-off coupon. The unique constraint on referred_customer_id
// guarantees this never grants twice for the same referred customer.
export async function grantReferralRewardIfEligible(customerId: string) {
  const service = await createServiceRoleClient();

  const { count } = await service
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", customerId);
  if ((count ?? 0) !== 1) return;

  const { data: profile } = await service
    .from("profiles")
    .select("referred_by")
    .eq("id", customerId)
    .single();
  if (!profile?.referred_by) return;

  await service.from("coupons").insert({
    owner_id: profile.referred_by,
    code: `REF-${randomCode(6)}`,
    discount_percent: REFERRAL_REWARD_PERCENT,
    source: "referral",
    referred_customer_id: customerId,
  });
}

export async function getMyCoupons(): Promise<Coupon[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("coupons")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (data as Coupon[]) ?? [];
}

export async function previewCoupon(
  code: string,
): Promise<{ discountPercent: number } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauthorized" };
  if (!code.trim()) return { error: "invalid" };

  const result = await validateCoupon(code, user.id);
  if (!result) return { error: "invalidCoupon" };
  return { discountPercent: result.discountPercent };
}

export async function validateCoupon(
  code: string,
  customerId: string,
): Promise<{ discountPercent: number; couponId: string } | null> {
  const service = await createServiceRoleClient();
  const { data: coupon } = await service
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("owner_id", customerId)
    .eq("status", "active")
    .maybeSingle();

  if (!coupon) return null;
  return { discountPercent: coupon.discount_percent, couponId: coupon.id };
}

export async function markCouponUsed(couponId: string, orderId: string) {
  const service = await createServiceRoleClient();
  await service
    .from("coupons")
    .update({ status: "used", used_at: new Date().toISOString(), used_on_order_id: orderId })
    .eq("id", couponId);
}
