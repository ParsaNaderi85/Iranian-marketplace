import { createServiceRoleClient } from "@/lib/supabase/server";
import { getResend, EMAIL_FROM } from "@/lib/email/client";
import type { OrderStatus } from "@/lib/types";

export async function getUserEmail(userId: string): Promise<string | null> {
  const supabase = await createServiceRoleClient();
  const { data } = await supabase.auth.admin.getUserById(userId);
  return data.user?.email ?? null;
}

type OrderEmailContext = {
  orderId: string;
  vendorName: string;
  total: number;
  customerId: string;
  vendorOwnerId: string;
};

async function loadOrderContext(orderId: string): Promise<OrderEmailContext | null> {
  const supabase = await createServiceRoleClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, customer_id, total_aed, vendor_id, vendors(name, owner_id)")
    .eq("id", orderId)
    .single();
  if (!order) return null;

  const vendor = Array.isArray(order.vendors) ? order.vendors[0] : order.vendors;
  if (!vendor) return null;

  return {
    orderId: order.id,
    vendorName: vendor.name as string,
    total: order.total_aed as number,
    customerId: order.customer_id as string,
    vendorOwnerId: vendor.owner_id as string,
  };
}

/**
 * Fires right after an order is created — both COD and online-payment orders,
 * since there's no Stripe webhook wired up yet to gate this on payment
 * confirmation. Best-effort: a failed send never blocks order placement.
 */
export async function sendOrderPlacedEmails(orderId: string): Promise<void> {
  try {
    const ctx = await loadOrderContext(orderId);
    if (!ctx) return;

    const [customerEmail, vendorEmail] = await Promise.all([
      getUserEmail(ctx.customerId),
      getUserEmail(ctx.vendorOwnerId),
    ]);

    const resend = getResend();
    const shortId = ctx.orderId.slice(0, 8);

    const sends: Promise<unknown>[] = [];
    if (customerEmail) {
      sends.push(
        resend.emails.send({
          from: EMAIL_FROM,
          to: customerEmail,
          subject: `Order received — ${ctx.vendorName}`,
          text: `Thanks for your order at ${ctx.vendorName}!\n\nOrder #${shortId}\nTotal: ${ctx.total.toFixed(2)} AED\n\nWe'll email you again once the vendor updates your order status.`,
        }),
      );
    }
    if (vendorEmail) {
      sends.push(
        resend.emails.send({
          from: EMAIL_FROM,
          to: vendorEmail,
          subject: `New order — #${shortId}`,
          text: `You have a new order on Iranian Marketplace.\n\nOrder #${shortId}\nTotal: ${ctx.total.toFixed(2)} AED\n\nOpen your vendor dashboard to view the items and update its status.`,
        }),
      );
    }
    await Promise.all(sends);
  } catch {
    // Never let a notification failure block checkout.
  }
}

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending: "is pending confirmation",
  confirmed: "has been confirmed by the vendor",
  out_for_delivery: "is out for delivery",
  delivered: "has been delivered",
  cancelled: "has been cancelled",
};

export async function sendOrderStatusEmail(
  orderId: string,
  status: OrderStatus,
  reviewIncentiveCode?: string | null,
): Promise<void> {
  try {
    const ctx = await loadOrderContext(orderId);
    if (!ctx) return;

    const customerEmail = await getUserEmail(ctx.customerId);
    if (!customerEmail) return;

    const shortId = ctx.orderId.slice(0, 8);
    const incentiveText = reviewIncentiveCode
      ? `\n\nLeave a review for ${ctx.vendorName} and use code ${reviewIncentiveCode} for 10% off your next order.`
      : "";
    await getResend().emails.send({
      from: EMAIL_FROM,
      to: customerEmail,
      subject: `Order #${shortId} update — ${ctx.vendorName}`,
      text: `Your order #${shortId} at ${ctx.vendorName} ${STATUS_MESSAGES[status]}.${incentiveText}`,
    });
  } catch {
    // Best-effort notification only.
  }
}
