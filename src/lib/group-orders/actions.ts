"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth/session";
import { placeOrder, type CheckoutResult } from "@/lib/checkout/actions";

export type ActionState = { error?: string } | undefined;

export async function createGroupOrder(
  vendorId: string,
): Promise<{ groupOrderId?: string; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauthorized" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_orders")
    .insert({ organizer_id: user.id, vendor_id: vendorId })
    .select("id")
    .single();
  if (error || !data) return { error: "invalid" };

  return { groupOrderId: data.id };
}

const addItemSchema = z.object({
  groupOrderId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1),
});

export async function addGroupOrderItem(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauthorized" };

  const parsed = addItemSchema.safeParse({
    groupOrderId: formData.get("groupOrderId"),
    productId: formData.get("productId"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) return { error: "invalid" };

  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("group_order_items").insert({
    group_order_id: parsed.data.groupOrderId,
    contributor_id: user.id,
    contributor_name: profile?.full_name ?? user.email ?? "Guest",
    product_id: parsed.data.productId,
    quantity: parsed.data.quantity,
  });
  if (error) return { error: "invalid" };

  return undefined;
}

export async function removeGroupOrderItem(itemId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase.from("group_order_items").delete().eq("id", itemId);
}

const checkoutSchema = z.object({
  groupOrderId: z.string().uuid(),
  paymentMethod: z.enum(["online", "cod"]),
  addressLabel: z.string().min(1),
  addressLine1: z.string().min(1),
  area: z.string().min(1),
  locale: z.string(),
});

export async function checkoutGroupOrder(
  input: z.infer<typeof checkoutSchema>,
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { error: "invalid" };

  const user = await getCurrentUser();
  if (!user) return { error: "unauthorized" };

  const supabase = await createClient();
  const { data: groupOrder } = await supabase
    .from("group_orders")
    .select("*")
    .eq("id", parsed.data.groupOrderId)
    .single();
  if (!groupOrder || groupOrder.organizer_id !== user.id) {
    return { error: "unauthorized" };
  }
  if (groupOrder.status !== "open") return { error: "alreadyCheckedOut" };

  const { data: items } = await supabase
    .from("group_order_items")
    .select("product_id, quantity")
    .eq("group_order_id", groupOrder.id);
  if (!items || items.length === 0) return { error: "empty" };

  const quantityByProduct = new Map<string, number>();
  for (const item of items) {
    quantityByProduct.set(
      item.product_id,
      (quantityByProduct.get(item.product_id) ?? 0) + item.quantity,
    );
  }

  const result = await placeOrder({
    vendorId: groupOrder.vendor_id,
    items: Array.from(quantityByProduct, ([productId, quantity]) => ({
      productId,
      quantity,
    })),
    paymentMethod: parsed.data.paymentMethod,
    addressLabel: parsed.data.addressLabel,
    addressLine1: parsed.data.addressLine1,
    area: parsed.data.area,
    locale: parsed.data.locale,
  });

  if ("orderId" in result) {
    await supabase
      .from("group_orders")
      .update({ status: "checked_out", order_id: result.orderId })
      .eq("id", groupOrder.id);
  }

  return result;
}
