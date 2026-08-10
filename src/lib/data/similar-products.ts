"use server";

import { createClient } from "@/lib/supabase/server";
import { normalizeProduct } from "@/lib/data/products";
import type { Product } from "@/lib/types";

// "Similar" = other available products from the same vendor, preferring the
// same category as what's already in the cart, falling back to any other
// product from that vendor if there's no category overlap.
export async function getSimilarProducts(
  vendorId: string,
  excludeProductIds: string[],
  limit = 4,
): Promise<Product[]> {
  const supabase = await createClient();

  const { data: cartProducts } = await supabase
    .from("products")
    .select("category_id")
    .in("id", excludeProductIds.length > 0 ? excludeProductIds : ["00000000-0000-0000-0000-000000000000"]);

  const categoryIds = Array.from(
    new Set((cartProducts ?? []).map((p) => p.category_id).filter(Boolean)),
  );

  let query = supabase
    .from("products")
    .select("*")
    .eq("vendor_id", vendorId)
    .eq("is_available", true)
    .limit(limit);

  if (excludeProductIds.length > 0) {
    query = query.not("id", "in", `(${excludeProductIds.join(",")})`);
  }
  if (categoryIds.length > 0) {
    query = query.in("category_id", categoryIds);
  }

  const { data } = await query;

  if ((data?.length ?? 0) >= limit || categoryIds.length === 0) {
    return ((data as Product[]) ?? []).map(normalizeProduct);
  }

  // Not enough same-category matches — top up with any other available
  // product from the same vendor.
  let fallbackQuery = supabase
    .from("products")
    .select("*")
    .eq("vendor_id", vendorId)
    .eq("is_available", true)
    .limit(limit);

  const alreadyExcluded = [...excludeProductIds, ...(data ?? []).map((p) => p.id)];
  if (alreadyExcluded.length > 0) {
    fallbackQuery = fallbackQuery.not("id", "in", `(${alreadyExcluded.join(",")})`);
  }

  const { data: fallback } = await fallbackQuery;
  return [...((data as Product[]) ?? []), ...((fallback as Product[]) ?? [])]
    .map(normalizeProduct)
    .slice(0, limit);
}
