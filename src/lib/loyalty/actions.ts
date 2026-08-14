"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  REDEMPTION_COST,
  REDEMPTION_DISCOUNT_PERCENT,
  calculateLoyaltyPointsEarned,
} from "@/lib/loyalty/constants";

function randomCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 confusion
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Called when an order is marked delivered — awards 1 point per AED spent.
export async function awardLoyaltyPoints(
  customerId: string,
  totalAed: number,
): Promise<void> {
  const service = await createServiceRoleClient();
  const points = calculateLoyaltyPointsEarned(totalAed);
  if (points <= 0) return;

  const { data: profile } = await service
    .from("profiles")
    .select("loyalty_points")
    .eq("id", customerId)
    .single();
  if (!profile) return;

  await service
    .from("profiles")
    .update({ loyalty_points: profile.loyalty_points + points })
    .eq("id", customerId);
}

export async function redeemLoyaltyPoints(
  locale: string,
): Promise<{ error?: string; code?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauthorized" };

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("loyalty_points")
    .eq("id", user.id)
    .single();
  if (!profile || profile.loyalty_points < REDEMPTION_COST) {
    return { error: "notEnoughPoints" };
  }

  const code = `LOYAL-${randomCode()}`;
  const { error: couponError } = await supabase.from("coupons").insert({
    owner_id: user.id,
    code,
    discount_percent: REDEMPTION_DISCOUNT_PERCENT,
    source: "loyalty",
  });
  if (couponError) return { error: "invalid" };

  await supabase
    .from("profiles")
    .update({ loyalty_points: profile.loyalty_points - REDEMPTION_COST })
    .eq("id", user.id);

  revalidatePath(`/${locale}/loyalty`);
  return { code };
}
