import { createClient } from "@/lib/supabase/server";
import type { OrderStatus, VendorStatus, VendorType } from "@/lib/types";

export type AdminAnalytics = {
  gmv: number;
  platformCommissionRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  vendorsByStatus: Record<VendorStatus, number>;
  vendorsByType: Record<VendorType, number>;
  topVendors: { id: string; name: string; revenue: number; orders: number }[];
  revenueByDay: { date: string; revenue: number }[];
};

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const supabase = await createClient();

  const [{ data: orders }, { data: vendors }] = await Promise.all([
    supabase.from("orders").select("*"),
    supabase.from("vendors").select("id, name, type, status"),
  ]);

  const allOrders = orders ?? [];
  const allVendors = vendors ?? [];
  const nonCancelled = allOrders.filter((o) => o.status !== "cancelled");

  const gmv = nonCancelled.reduce((s, o) => s + o.subtotal_aed, 0);
  const platformCommissionRevenue = nonCancelled.reduce(
    (s, o) => s + o.commission_amount_aed,
    0,
  );

  const ordersByStatus: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const o of allOrders) ordersByStatus[o.status as OrderStatus]++;

  const vendorsByStatus: Record<VendorStatus, number> = {
    pending: 0,
    approved: 0,
    suspended: 0,
  };
  const vendorsByType: Record<VendorType, number> = {
    supermarket: 0,
    restaurant: 0,
    bakery: 0,
    cafe: 0,
    catering: 0,
  };
  for (const v of allVendors) {
    vendorsByStatus[v.status as VendorStatus]++;
    vendorsByType[v.type as VendorType]++;
  }

  const vendorAgg: Record<string, { revenue: number; orders: number }> = {};
  for (const o of nonCancelled) {
    const agg = (vendorAgg[o.vendor_id] ??= { revenue: 0, orders: 0 });
    agg.revenue += o.total_aed;
    agg.orders++;
  }
  const vendorNameById = new Map(allVendors.map((v) => [v.id, v.name]));
  const topVendors = Object.entries(vendorAgg)
    .map(([id, agg]) => ({ id, name: vendorNameById.get(id) ?? "—", ...agg }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const byDate: Record<string, number> = {};
  for (const o of nonCancelled) {
    const date = (o.created_at as string).slice(0, 10);
    byDate[date] = (byDate[date] ?? 0) + o.total_aed;
  }
  const revenueByDay: { date: string; revenue: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    revenueByDay.push({ date: key, revenue: byDate[key] ?? 0 });
  }

  return {
    gmv,
    platformCommissionRevenue,
    totalOrders: allOrders.length,
    avgOrderValue: nonCancelled.length ? gmv / nonCancelled.length : 0,
    ordersByStatus,
    vendorsByStatus,
    vendorsByType,
    topVendors,
    revenueByDay,
  };
}
