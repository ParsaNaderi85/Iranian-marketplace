import { createClient } from "@/lib/supabase/server";
import type { Review } from "@/lib/types";

export async function getReviewsForVendor(vendorId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  return (data as Review[]) ?? [];
}

export async function getRatingSummary(
  vendorId: string,
): Promise<{ average: number; count: number }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("rating")
    .eq("vendor_id", vendorId);

  if (!data || data.length === 0) return { average: 0, count: 0 };
  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  return { average: sum / data.length, count: data.length };
}

export async function getRatingSummaries(
  vendorIds: string[],
): Promise<Record<string, { average: number; count: number }>> {
  if (vendorIds.length === 0) return {};
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("vendor_id, rating")
    .in("vendor_id", vendorIds);

  const grouped: Record<string, number[]> = {};
  for (const r of data ?? []) {
    (grouped[r.vendor_id] ??= []).push(r.rating);
  }

  const result: Record<string, { average: number; count: number }> = {};
  for (const [vendorId, ratings] of Object.entries(grouped)) {
    result[vendorId] = {
      average: ratings.reduce((a, b) => a + b, 0) / ratings.length,
      count: ratings.length,
    };
  }
  return result;
}

export async function customerHasDeliveredOrder(
  customerId: string,
  vendorId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", customerId)
    .eq("vendor_id", vendorId)
    .eq("status", "delivered");

  return (count ?? 0) > 0;
}
