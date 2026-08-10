"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { getVendorByOwnerId } from "@/lib/data/vendors";
import { getUserEmail } from "@/lib/email/order-emails";
import { getResend, EMAIL_FROM } from "@/lib/email/client";

export async function sendReorderReminder(
  customerId: string,
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauthorized" };

  const vendor = await getVendorByOwnerId(user.id);
  if (!vendor) return { error: "unauthorized" };

  const customerEmail = await getUserEmail(customerId);
  if (!customerEmail) return { error: "notFound" };

  try {
    await getResend().emails.send({
      from: EMAIL_FROM,
      to: customerEmail,
      subject: `We miss you at ${vendor.name}!`,
      text: `It's been a while since your last order from ${vendor.name} on Iranian Marketplace. Come back and see what's new — we'd love to serve you again.`,
    });
    return {};
  } catch {
    return { error: "sendFailed" };
  }
}
