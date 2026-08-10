import { getOrdersForVendor } from "@/lib/data/orders";
import { getRatingSummary } from "@/lib/data/reviews";
import { getExternalSalesForVendor } from "@/lib/data/external-sales";
import { getAllProductsForVendor, getCategoryPriceAverages } from "@/lib/data/products";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus, PaymentMethod } from "@/lib/types";

export type VendorAnalytics = {
  // Revenue & sales performance
  gmv: number;
  netRevenue: number;
  avgOrderValue: number;
  salesGrowthRate: number | null;
  // Combined-channel picture (marketplace + manually logged external sales)
  marketplaceRevenue: number;
  externalRevenue: number;
  combinedRevenue: number;
  totalCommission: number;
  netEarnings: number;
  totalOrders: number;
  completedOrders: number;
  ordersByStatus: Record<OrderStatus, number>;
  paymentBreakdown: Record<PaymentMethod, { count: number; revenue: number }>;
  // Customer dynamics
  uniqueCustomers: number;
  repeatCustomers: number;
  repeatBuyerRate: number;
  rating: { average: number; count: number };
  rating30d: { average: number; count: number };
  cancellationRate: number;
  // Products
  topProductsByRevenue: { name: string; quantity: number; revenue: number }[];
  topProductsByVolume: { name: string; quantity: number; revenue: number }[];
  deadStock: { id: string; name: string }[];
  priceCompetitiveness: {
    id: string;
    name: string;
    price: number;
    categoryAverage: number;
    diffPercent: number;
  }[];
  revenueByDay: { date: string; revenue: number }[];
};

export async function getVendorAnalytics(
  vendorId: string,
): Promise<VendorAnalytics> {
  const [orders, rating, externalSales, products] = await Promise.all([
    getOrdersForVendor(vendorId),
    getRatingSummary(vendorId),
    getExternalSalesForVendor(vendorId),
    getAllProductsForVendor(vendorId),
  ]);

  const nonCancelled = orders.filter((o) => o.status !== "cancelled");

  // --- Revenue & sales performance -----------------------------------
  const gmv = nonCancelled.reduce((s, o) => s + o.subtotal_aed, 0);
  const marketplaceRevenue = nonCancelled.reduce((s, o) => s + o.total_aed, 0);
  const externalRevenue = externalSales.reduce((s, e) => s + e.amount_aed, 0);
  const totalCommission = nonCancelled.reduce(
    (s, o) => s + o.commission_amount_aed,
    0,
  );
  const netRevenue = marketplaceRevenue - totalCommission;

  const now = new Date();
  const cutoff30 = new Date(now);
  cutoff30.setDate(now.getDate() - 30);
  const cutoff60 = new Date(now);
  cutoff60.setDate(now.getDate() - 60);

  const last30 = nonCancelled.filter((o) => new Date(o.created_at) >= cutoff30);
  const prev30 = nonCancelled.filter(
    (o) => new Date(o.created_at) >= cutoff60 && new Date(o.created_at) < cutoff30,
  );
  const last30Revenue = last30.reduce((s, o) => s + o.total_aed, 0);
  const prev30Revenue = prev30.reduce((s, o) => s + o.total_aed, 0);
  const salesGrowthRate =
    prev30Revenue > 0
      ? ((last30Revenue - prev30Revenue) / prev30Revenue) * 100
      : last30Revenue > 0
        ? 100
        : null;

  // --- Orders & payments ------------------------------------------------
  const ordersByStatus: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const o of orders) ordersByStatus[o.status]++;
  const cancellationRate = orders.length
    ? (ordersByStatus.cancelled / orders.length) * 100
    : 0;

  const paymentBreakdown: Record<PaymentMethod, { count: number; revenue: number }> = {
    online: { count: 0, revenue: 0 },
    cod: { count: 0, revenue: 0 },
  };
  for (const o of nonCancelled) {
    paymentBreakdown[o.payment_method].count++;
    paymentBreakdown[o.payment_method].revenue += o.total_aed;
  }

  // --- Customers ----------------------------------------------------
  const customerCounts: Record<string, number> = {};
  for (const o of orders) {
    customerCounts[o.customer_id] = (customerCounts[o.customer_id] ?? 0) + 1;
  }
  const uniqueCustomers = Object.keys(customerCounts).length;
  const repeatCustomers = Object.values(customerCounts).filter((c) => c > 1).length;
  const repeatBuyerRate = uniqueCustomers ? (repeatCustomers / uniqueCustomers) * 100 : 0;

  const supabase = await createClient();
  const { data: recentReviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("vendor_id", vendorId)
    .gte("created_at", cutoff30.toISOString());
  const rating30d = {
    average: recentReviews?.length
      ? recentReviews.reduce((s, r) => s + r.rating, 0) / recentReviews.length
      : 0,
    count: recentReviews?.length ?? 0,
  };

  // --- Products -------------------------------------------------------
  const productAgg: Record<
    string,
    { productId: string | null; name: string; quantity: number; revenue: number }
  > = {};
  for (const o of nonCancelled) {
    for (const item of o.order_items) {
      const agg = (productAgg[item.name_snapshot] ??= {
        productId: item.product_id,
        name: item.name_snapshot,
        quantity: 0,
        revenue: 0,
      });
      agg.quantity += item.quantity;
      agg.revenue += item.quantity * item.price_snapshot_aed;
    }
  }
  const productList = Object.values(productAgg);
  const topProductsByRevenue = [...productList]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(({ name, quantity, revenue }) => ({ name, quantity, revenue }));
  const topProductsByVolume = [...productList]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map(({ name, quantity, revenue }) => ({ name, quantity, revenue }));

  const soldProductIds = new Set(
    nonCancelled
      .filter((o) => new Date(o.created_at) >= cutoff60)
      .flatMap((o) => o.order_items.map((i) => i.product_id))
      .filter((id): id is string => Boolean(id)),
  );
  const deadStock = products
    .filter((p) => p.is_available && !soldProductIds.has(p.id))
    .map((p) => ({ id: p.id, name: p.name }));

  const categoryIds = [
    ...new Set(products.map((p) => p.category_id).filter((id): id is string => Boolean(id))),
  ];
  const categoryAverages = await getCategoryPriceAverages(categoryIds);
  const priceCompetitiveness = products
    .filter((p) => p.category_id && categoryAverages[p.category_id])
    .map((p) => {
      const categoryAverage = categoryAverages[p.category_id!];
      return {
        id: p.id,
        name: p.name,
        price: p.price_aed,
        categoryAverage,
        diffPercent: ((p.price_aed - categoryAverage) / categoryAverage) * 100,
      };
    });

  // --- Revenue over time (combined channels) --------------------------
  const byDate: Record<string, number> = {};
  for (const o of nonCancelled) {
    const date = o.created_at.slice(0, 10);
    byDate[date] = (byDate[date] ?? 0) + o.total_aed;
  }
  for (const e of externalSales) {
    byDate[e.sale_date] = (byDate[e.sale_date] ?? 0) + e.amount_aed;
  }
  const days: { date: string; revenue: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, revenue: byDate[key] ?? 0 });
  }

  const combinedRevenue = marketplaceRevenue + externalRevenue;

  return {
    gmv,
    netRevenue,
    avgOrderValue: nonCancelled.length ? marketplaceRevenue / nonCancelled.length : 0,
    salesGrowthRate,
    marketplaceRevenue,
    externalRevenue,
    combinedRevenue,
    totalCommission,
    netEarnings: combinedRevenue - totalCommission,
    totalOrders: orders.length,
    completedOrders: nonCancelled.length,
    ordersByStatus,
    paymentBreakdown,
    uniqueCustomers,
    repeatCustomers,
    repeatBuyerRate,
    rating,
    rating30d,
    cancellationRate,
    topProductsByRevenue,
    topProductsByVolume,
    deadStock,
    priceCompetitiveness,
    revenueByDay: days,
  };
}
