"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getStripe } from "@/lib/stripe/server";
import { geocodeAddress } from "@/lib/geocode";
import { sendOrderPlacedEmails } from "@/lib/email/order-emails";
import {
  validateCoupon,
  markCouponUsed,
  grantReferralRewardIfEligible,
} from "@/lib/referral/actions";
import { validateVendorCoupon } from "@/lib/vendor/coupon-actions";
import {
  calculateSubtotal,
  calculateCommission,
  calculateDiscountedSubtotal,
  calculateOrderTotal,
} from "@/lib/checkout/pricing";

export async function previewAnyCoupon(
  code: string,
  vendorId: string,
): Promise<{ discountPercent: number } | { error: string }> {
  if (!code.trim()) return { error: "invalid" };

  const user = await getCurrentUser();
  if (!user) return { error: "unauthorized" };

  const referral = await validateCoupon(code, user.id);
  if (referral) return { discountPercent: referral.discountPercent };

  const vendorCoupon = await validateVendorCoupon(code, vendorId);
  if (vendorCoupon) return { discountPercent: vendorCoupon.discountPercent };

  return { error: "invalidCoupon" };
}

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
export type CheckoutResult =
  | { redirectUrl: string; orderId: string }
  | { error: string };

export async function getVendorDeliveryFee(vendorId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vendors")
    .select("delivery_fee_aed")
    .eq("id", vendorId)
    .single();
  return (data?.delivery_fee_aed as number) ?? 0;
}

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

  // Fast, non-authoritative pre-check for quick user feedback. The real
  // enforcement is the atomic RPC call below, done at write time, which is
  // what actually prevents overselling under concurrent checkouts.
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)!;
    if (
      product.stock_quantity != null &&
      product.stock_quantity < item.quantity
    ) {
      return { error: "insufficientStock" };
    }
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

  const subtotal = calculateSubtotal(orderItems);
  const commissionRate = vendor.commission_rate as number;
  const commissionAmount = calculateCommission(subtotal, commissionRate);
  const deliveryFee = (vendor.delivery_fee_aed as number) ?? 0;

  const referralCoupon = couponCode
    ? await validateCoupon(couponCode, user.id)
    : null;
  const vendorCoupon =
    couponCode && !referralCoupon
      ? await validateVendorCoupon(couponCode, vendorId)
      : null;
  const discountPercent =
    referralCoupon?.discountPercent ?? vendorCoupon?.discountPercent ?? null;
  const discountedSubtotal = calculateDiscountedSubtotal(subtotal, discountPercent);
  const total = calculateOrderTotal(discountedSubtotal, deliveryFee);

  const deliveryGeo = await geocodeAddress(`${addressLine1}, ${area}, Dubai, UAE`);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      vendor_id: vendorId,
      payment_method: paymentMethod,
      subtotal_aed: subtotal,
      commission_amount_aed: commissionAmount,
      delivery_fee_aed: deliveryFee,
      total_aed: total,
      delivery_line1: `${addressLabel}: ${addressLine1}`,
      delivery_area: area,
      delivery_lat: deliveryGeo?.lat ?? null,
      delivery_lng: deliveryGeo?.lng ?? null,
    })
    .select()
    .single();

  if (orderError || !order) return { error: "orderFailed" };

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) return { error: "orderFailed" };

  const { error: stockError } = await supabase.rpc("decrement_stock_for_order", {
    items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
  });
  if (stockError) {
    // Real stock ran out between the pre-check and this atomic write —
    // unwind the order we just created rather than leave a phantom order.
    await supabase.from("order_items").delete().eq("order_id", order.id);
    await supabase.from("orders").delete().eq("id", order.id);
    return { error: "insufficientStock" };
  }

  if (referralCoupon) {
    await markCouponUsed(referralCoupon.couponId, order.id);
  }
  await grantReferralRewardIfEligible(user.id);
  await sendOrderPlacedEmails(order.id);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (paymentMethod === "cod") {
    return {
      redirectUrl: `/${locale}/checkout/success?order=${order.id}`,
      orderId: order.id,
    };
  }

  // Discount (if any) is applied per line item rather than via a Stripe
  // session-level coupon, since the delivery fee line below must stay
  // undiscounted to match the total we already calculated above.
  const discountMultiplier = discountPercent ? 1 - discountPercent / 100 : 1;
  const lineItems = orderItems.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: "aed",
      unit_amount: Math.round(item.price_snapshot_aed * discountMultiplier * 100),
      product_data: { name: item.name_snapshot },
    },
  }));

  if (deliveryFee > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "aed",
        unit_amount: Math.round(deliveryFee * 100),
        product_data: { name: "Delivery fee" },
      },
    });
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    line_items: lineItems,
    success_url: `${siteUrl}/${locale}/checkout/success?order=${order.id}`,
    cancel_url: `${siteUrl}/${locale}/checkout`,
    metadata: { order_id: order.id },
  });

  await supabase
    .from("orders")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", order.id);

  if (!session.url) return { error: "orderFailed" };
  return { redirectUrl: session.url, orderId: order.id };
}
