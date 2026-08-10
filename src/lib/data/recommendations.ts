import { createClient } from "@/lib/supabase/server";
import { normalizeProduct } from "@/lib/data/products";
import type { Product } from "@/lib/types";

export type RecommendedProduct = Product & {
  vendorId: string;
  vendorName: string;
};

// Looks at which categories a customer has previously ordered from, then
// suggests other available products in those same categories they haven't
// tried yet. Returns [] for customers with no order history.
export async function getPersonalizedRecommendations(
  customerId: string,
  limit = 8,
): Promise<RecommendedProduct[]> {
  const supabase = await createClient();

  const { data: pastOrders } = await supabase
    .from("orders")
    .select("order_items(product_id)")
    .eq("customer_id", customerId);

  const orderedProductIds = Array.from(
    new Set(
      (pastOrders ?? [])
        .flatMap((o) => o.order_items)
        .map((i) => i.product_id)
        .filter((id): id is string => id != null),
    ),
  );
  if (orderedProductIds.length === 0) return [];

  const { data: orderedProducts } = await supabase
    .from("products")
    .select("category_id")
    .in("id", orderedProductIds);

  const categoryIds = Array.from(
    new Set((orderedProducts ?? []).map((p) => p.category_id).filter(Boolean)),
  );
  if (categoryIds.length === 0) return [];

  const { data } = await supabase
    .from("products")
    .select("*, vendors!inner(id, name, status)")
    .in("category_id", categoryIds)
    .not("id", "in", `(${orderedProductIds.join(",")})`)
    .eq("is_available", true)
    .eq("vendors.status", "approved")
    .limit(limit);

  type Row = Product & { vendors: { id: string; name: string } };
  return ((data as unknown as Row[]) ?? []).map((p) => ({
    ...normalizeProduct(p),
    vendorId: p.vendors.id,
    vendorName: p.vendors.name,
  }));
}
