"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getStripe } from "@/lib/stripe/server";
import {
  validateCoupon,
  markCouponUsed,
  grantReferralRewardIfEligible,
} from "@/lib/referral/actions";

const checkoutSchema = z.object({
  vendorId: z.string().uuid(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
  paymentMethod: z.enum(["online", "cod"]),
  addressLabel: z.string().min(1),
  addressLine1: z.string().min(1),
  area: z.string().min(1),
  locale: z.string(),
  couponCode: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutResult = { redirectUrl: string } | { error: string };

export async function placeOrder(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { error: "invalid" };

  const user = await getCurrentUser();
  if (!user) return { error: "unauthorized" };

  const {
    vendorId,
    items,
    paymentMethod,
    addressLabel,
    addressLine1,
    area,
    locale,
    couponCode,
  } = parsed.data;

  const supabase = await createClient();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", vendorId)
    .eq("status", "approved")
    .single();
  if (!vendor) return { error: "vendorUnavailable" };

  const productIds = items.map((i) => i.productId);
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds)
    .eq("vendor_id", vendorId)
    .eq("is_available", true);

  if (!products || products.length !== items.length) {
    return { error: "productsUnavailable" };
  }

  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return {
      product_id: product.id,
      name_snapshot: product.name as string,
      price_snapshot_aed: product.price_aed as number,
      quantity: item.quantity,
    };
  });

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price_snapshot_aed * item.quantity,
    0,
  );
  const commissionRate = vendor.commission_rate as number;
  const commissionAmount = Math.round(subtotal * (commissionRate / 100) * 100) / 100;

  const coupon = couponCode
    ? await validateCoupon(couponCode, user.id)
    : null;
  const total = coupon
    ? Math.round(subtotal * (1 - coupon.discountPercent / 100) * 100) / 100
    : subtotal;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      vendor_id: vendorId,
      payment_method: paymentMethod,
      subtotal_aed: subtotal,
      commission_amount_aed: commissionAmount,
      total_aed: total,
      delivery_line1: `${addressLabel}: ${addressLine1}`,
      delivery_area: area,
    })
    .select()
    .single();

  if (orderError || !order) return { error: "orderFailed" };

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) return { error: "orderFailed" };

  if (coupon) {
    await markCouponUsed(coupon.couponId, order.id);
  }
  await grantReferralRewardIfEligible(user.id);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (paymentMethod === "cod") {
    return { redirectUrl: `/${locale}/checkout/success?order=${order.id}` };
  }

  const lineItems = orderItems.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: "aed",
      unit_amount: Math.round(item.price_snapshot_aed * 100),
      product_data: { name: item.name_snapshot },
    },
  }));

  let stripeDiscounts: { coupon: string }[] | undefined;
  if (coupon) {
    const stripeCoupon = await getStripe().coupons.create({
      percent_off: coupon.discountPercent,
      duration: "once",
      name: `Referral discount (${coupon.discountPercent}%)`,
    });
    stripeDiscounts = [{ coupon: stripeCoupon.id }];
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    line_items: lineItems,
    discounts: stripeDiscounts,
    success_url: `${siteUrl}/${locale}/checkout/success?order=${order.id}`,
    cancel_url: `${siteUrl}/${locale}/checkout`,
    metadata: { order_id: order.id },
  });

  await supabase
    .from("orders")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", order.id);

  if (!session.url) return { error: "orderFailed" };
  return { redirectUrl: session.url };
}
