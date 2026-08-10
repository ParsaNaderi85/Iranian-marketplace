import { createClient } from "@/lib/supabase/server";
import type { GroupOrder } from "@/lib/types";

export type GroupOrderItemWithProduct = {
  id: string;
  contributorId: string;
  contributorName: string;
  productId: string;
  productName: string;
  priceAed: number;
  quantity: number;
};

export async function getGroupOrder(id: string): Promise<GroupOrder | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("group_orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as GroupOrder | null) ?? null;
}

export async function getGroupOrderItems(
  groupOrderId: string,
): Promise<GroupOrderItemWithProduct[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("group_order_items")
    .select("id, contributor_id, contributor_name, product_id, quantity, products(name, price_aed, sale_price_aed)")
    .eq("group_order_id", groupOrderId)
    .order("created_at");

  type Row = {
    id: string;
    contributor_id: string;
    contributor_name: string;
    product_id: string;
    quantity: number;
    products:
      | { name: string; price_aed: number; sale_price_aed: number | null }
      | { name: string; price_aed: number; sale_price_aed: number | null }[]
      | null;
  };

  return ((data as Row[]) ?? []).map((row) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    return {
      id: row.id,
      contributorId: row.contributor_id,
      contributorName: row.contributor_name,
      productId: row.product_id,
      productName: product?.name ?? "—",
      priceAed: product?.sale_price_aed ?? product?.price_aed ?? 0,
      quantity: row.quantity,
    };
  });
}
