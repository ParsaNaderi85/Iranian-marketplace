import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/lib/types";

export type OrderWithItems = Order & { order_items: OrderItem[] };

export async function getOrdersForVendor(
  vendorId: string,
): Promise<OrderWithItems[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  return (data as OrderWithItems[]) ?? [];
}

export async function getOrdersForCustomer(
  customerId: string,
): Promise<OrderWithItems[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  return (data as OrderWithItems[]) ?? [];
}

export async function getAllOrders(): Promise<OrderWithItems[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  return (data as OrderWithItems[]) ?? [];
}
