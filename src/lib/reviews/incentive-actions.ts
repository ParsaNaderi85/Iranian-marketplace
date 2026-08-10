"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

const REVIEW_INCENTIVE_PERCENT = 10;

function randomCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 confusion
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Called once, right when an order transitions to "delivered" — rewards the
// customer with a one-time coupon for leaving a review on that order.
export async function grantReviewIncentive(
  customerId: string,
): Promise<string | null> {
  const service = await createServiceRoleClient();
  const code = `RVW-${randomCode()}`;

  const { error } = await service.from("coupons").insert({
    owner_id: customerId,
    code,
    discount_percent: REVIEW_INCENTIVE_PERCENT,
    source: "review_incentive",
  });
  if (error) return null;
  return code;
}
