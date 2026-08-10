import { createClient } from "@/lib/supabase/server";
import type { Product, Category, VendorType } from "@/lib/types";

// Columns added by a schema migration that may not have been applied yet in
// every environment. Supabase omits missing columns from `select("*")`
// entirely (undefined) rather than returning null, so normalize them here —
// the boundary where raw rows become `Product[]` — instead of scattering
// `!= null` checks through every consumer.
export function normalizeProduct(row: Product): Product {
  return {
    ...row,
    sale_price_aed: row.sale_price_aed ?? null,
    cost_price_aed: row.cost_price_aed ?? null,
    stock_quantity: row.stock_quantity ?? null,
    low_stock_threshold: row.low_stock_threshold ?? 5,
    is_best_seller: row.is_best_seller ?? false,
  };
}

export type OnSaleProduct = Product & {
  vendors: { id: string; name: string; type: VendorType };
};

export async function getOnSaleProducts(
  limit = 8,
  type?: VendorType,
): Promise<OnSaleProduct[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, vendors!inner(id, name, type, status)")
    .not("sale_price_aed", "is", null)
    .gt("price_aed", 0)
    .eq("is_available", true)
    .eq("vendors.status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (type) {
    query = query.eq("vendors.type", type);
  }

  const { data } = await query;
  return ((data as unknown as OnSaleProduct[]) ?? []).map((p) => ({
    ...normalizeProduct(p),
    vendors: p.vendors,
  }));
}

export async function getAllProductsForVendor(
  vendorId: string,
): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  return ((data as Product[]) ?? []).map(normalizeProduct);
}

export async function getCategoryPriceAverages(
  categoryIds: string[],
): Promise<Record<string, number>> {
  if (categoryIds.length === 0) return {};
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("category_id, price_aed")
    .in("category_id", categoryIds)
    .eq("is_available", true);

  const sums: Record<string, { total: number; count: number }> = {};
  for (const row of data ?? []) {
    if (!row.category_id) continue;
    const bucket = (sums[row.category_id] ??= { total: 0, count: 0 });
    bucket.total += row.price_aed;
    bucket.count++;
  }

  const averages: Record<string, number> = {};
  for (const [categoryId, { total, count }] of Object.entries(sums)) {
    averages[categoryId] = total / count;
  }
  return averages;
}

export async function getCategoriesForType(
  vendorType: VendorType,
  vendorId?: string,
): Promise<Category[]> {
  const supabase = await createClient();
  let query = supabase.from("categories").select("*").eq("vendor_type", vendorType);

  query = vendorId
    ? query.or(`vendor_id.is.null,vendor_id.eq.${vendorId}`)
    : query.is("vendor_id", null);

  const { data } = await query.order("name");
  return (data as Category[]) ?? [];
}
