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

export async function getOrderForCustomer(
  orderId: string,
  customerId: string,
): Promise<OrderWithItems | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .eq("customer_id", customerId)
    .maybeSingle();

  return (data as OrderWithItems | null) ?? null;
}

export async function getOrderForInvoice(
  orderId: string,
  userId: string,
  isAdmin: boolean,
): Promise<OrderWithItems | null> {
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return null;

  if (isAdmin || order.customer_id === userId) return order as OrderWithItems;

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("id", order.vendor_id)
    .eq("owner_id", userId)
    .maybeSingle();
  return vendor ? (order as OrderWithItems) : null;
}

export async function getAllOrders(): Promise<OrderWithItems[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  return (data as OrderWithItems[]) ?? [];
}
