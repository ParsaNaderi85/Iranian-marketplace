import { createClient } from "@/lib/supabase/server";
import type { VendorPayout } from "@/lib/types";

export type PayoutSummary = {
  vendorId: string;
  vendorName: string;
  owedAed: number;
  unpaidOrderCount: number;
};

async function getUnpaidDeliveredOrders(vendorId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, subtotal_aed, commission_amount_aed")
    .eq("vendor_id", vendorId)
    .eq("status", "delivered")
    .eq("paid_out", false);
  return data ?? [];
}

export async function getVendorPayoutSummary(
  vendorId: string,
): Promise<{ owedAed: number; unpaidOrderCount: number }> {
  const orders = await getUnpaidDeliveredOrders(vendorId);
  const owedAed = orders.reduce(
    (sum, o) => sum + (o.subtotal_aed - o.commission_amount_aed),
    0,
  );
  return { owedAed, unpaidOrderCount: orders.length };
}

export async function getVendorPayoutHistory(
  vendorId: string,
): Promise<VendorPayout[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vendor_payouts")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });
  return (data as VendorPayout[]) ?? [];
}

export async function getAllPayoutSummaries(): Promise<PayoutSummary[]> {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("vendor_id, subtotal_aed, commission_amount_aed, vendors(name)")
    .eq("status", "delivered")
    .eq("paid_out", false);

  type Row = {
    vendor_id: string;
    subtotal_aed: number;
    commission_amount_aed: number;
    vendors: { name: string } | { name: string }[] | null;
  };

  const grouped = new Map<string, PayoutSummary>();
  for (const row of (orders as Row[]) ?? []) {
    const vendor = Array.isArray(row.vendors) ? row.vendors[0] : row.vendors;
    const existing = grouped.get(row.vendor_id);
    const net = row.subtotal_aed - row.commission_amount_aed;
    if (existing) {
      existing.owedAed += net;
      existing.unpaidOrderCount++;
    } else {
      grouped.set(row.vendor_id, {
        vendorId: row.vendor_id,
        vendorName: vendor?.name ?? "—",
        owedAed: net,
        unpaidOrderCount: 1,
      });
    }
  }
  return Array.from(grouped.values()).sort((a, b) => b.owedAed - a.owedAed);
}
