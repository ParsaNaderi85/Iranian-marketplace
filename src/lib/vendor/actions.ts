"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";
import { getVendorByOwnerId } from "@/lib/data/vendors";
import { VENDOR_TYPES, type OrderStatus, type VendorType } from "@/lib/types";
import { sendOrderStatusEmail } from "@/lib/email/order-emails";
import { grantReviewIncentive } from "@/lib/reviews/incentive-actions";
import { awardLoyaltyPoints } from "@/lib/loyalty/actions";

export type ActionState = { error?: string } | undefined;

const onboardingSchema = z.object({
  name: z.string().min(2),
  type: z.enum(VENDOR_TYPES as [string, ...string[]]),
  description: z.string().optional(),
  address: z.string().min(3),
  locale: z.string(),
});

export async function createVendorProfile(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "vendor_owner") {
    return { error: "unauthorized" };
  }

  const existing = await getVendorByOwnerId(profile.id);
  if (existing) {
    return { error: "alreadyExists" };
  }

  const parsed = onboardingSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    description: formData.get("description") || undefined,
    address: formData.get("address"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) {
    return { error: "invalid" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("vendors").insert({
    owner_id: profile.id,
    name: parsed.data.name,
    type: parsed.data.type as VendorType,
    description: parsed.data.description ?? null,
    address: parsed.data.address,
  });

  if (error) {
    return { error: "invalid" };
  }

  revalidatePath(`/${parsed.data.locale}/vendor`);
  return undefined;
}

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceAed: z.coerce.number().min(0),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  locale: z.string(),
});

export async function addProduct(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauthorized" };

  const vendor = await getVendorByOwnerId(user.id);
  if (!vendor) return { error: "noVendor" };

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    priceAed: formData.get("priceAed"),
    categoryId: formData.get("categoryId") || "",
    locale: formData.get("locale"),
  });
  if (!parsed.success) {
    return { error: "invalid" };
  }

  let imageUrl: string | null = null;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    if (image.size > 5 * 1024 * 1024) {
      return { error: "imageTooLarge" };
    }
    const uploaded = await uploadProductImage(vendor.id, image);
    if (!uploaded) return { error: "imageUploadFailed" };
    imageUrl = uploaded;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    vendor_id: vendor.id,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    price_aed: parsed.data.priceAed,
    category_id: parsed.data.categoryId || null,
    image_url: imageUrl,
  });

  if (error) return { error: "invalid" };

  revalidatePath(`/${parsed.data.locale}/vendor/products`);
  return undefined;
}

export async function updateDeliveryFee(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauthorized" };

  const vendor = await getVendorByOwnerId(user.id);
  if (!vendor) return { error: "noVendor" };

  const parsed = z.coerce.number().min(0).safeParse(formData.get("deliveryFeeAed"));
  if (!parsed.success) return { error: "invalid" };

  const locale = String(formData.get("locale") ?? "en");
  const supabase = await createClient();
  const { error } = await supabase
    .from("vendors")
    .update({ delivery_fee_aed: parsed.data })
    .eq("id", vendor.id);

  if (error) return { error: "invalid" };

  revalidatePath(`/${locale}/vendor`);
  return undefined;
}

async function uploadProductImage(
  vendorId: string,
  file: File,
): Promise<string | null> {
  const service = await createServiceRoleClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${vendorId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await service.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return null;

  const { data } = service.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

async function uploadVendorImage(
  vendorId: string,
  kind: "logo" | "banner",
  file: File,
): Promise<string | null> {
  const service = await createServiceRoleClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${vendorId}/${kind}.${ext}`;

  const { error } = await service.storage
    .from("vendor-logos")
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) return null;

  const { data } = service.storage.from("vendor-logos").getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function updateVendorImages(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauthorized" };

  const vendor = await getVendorByOwnerId(user.id);
  if (!vendor) return { error: "noVendor" };

  const locale = String(formData.get("locale") ?? "en");
  const updates: Record<string, string> = {};

  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    if (logo.size > 5 * 1024 * 1024) return { error: "imageTooLarge" };
    const uploaded = await uploadVendorImage(vendor.id, "logo", logo);
    if (!uploaded) return { error: "imageUploadFailed" };
    updates.logo_url = uploaded;
  }

  const banner = formData.get("banner");
  if (banner instanceof File && banner.size > 0) {
    if (banner.size > 5 * 1024 * 1024) return { error: "imageTooLarge" };
    const uploaded = await uploadVendorImage(vendor.id, "banner", banner);
    if (!uploaded) return { error: "imageUploadFailed" };
    updates.banner_url = uploaded;
  }

  if (Object.keys(updates).length === 0) return undefined;

  const supabase = await createClient();
  const { error } = await supabase.from("vendors").update(updates).eq("id", vendor.id);
  if (error) return { error: "invalid" };

  revalidatePath(`/${locale}/vendor/settings`);
  revalidatePath(`/${locale}/vendors/${vendor.id}`);
  return undefined;
}

export async function updateProductInventory(
  productId: string,
  costPriceAed: number | null,
  stockQuantity: number | null,
  locale: string,
) {
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase
    .from("products")
    .update({ cost_price_aed: costPriceAed, stock_quantity: stockQuantity })
    .eq("id", productId);
  revalidatePath(`/${locale}/vendor/products`);
}

export async function toggleProductAvailability(
  productId: string,
  isAvailable: boolean,
  locale: string,
) {
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase
    .from("products")
    .update({ is_available: isAvailable })
    .eq("id", productId);
  revalidatePath(`/${locale}/vendor/products`);
}

export async function deleteProduct(productId: string, locale: string) {
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", productId);
  revalidatePath(`/${locale}/vendor/products`);
}

const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
  pending: "confirmed",
  confirmed: "out_for_delivery",
  out_for_delivery: "delivered",
  delivered: null,
  cancelled: null,
};

export async function advanceOrderStatus(orderId: string, locale: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("status, customer_id, total_aed")
    .eq("id", orderId)
    .single();
  if (!order) return;

  const next = nextStatusMap[order.status as OrderStatus];
  if (!next) return;

  await supabase.from("orders").update({ status: next }).eq("id", orderId);
  revalidatePath(`/${locale}/vendor/orders`);
  revalidatePath(`/${locale}/orders`);

  let reviewIncentiveCode: string | null = null;
  if (next === "delivered") {
    reviewIncentiveCode = await grantReviewIncentive(order.customer_id);
    await awardLoyaltyPoints(order.customer_id, order.total_aed);
  }
  await sendOrderStatusEmail(orderId, next, reviewIncentiveCode);
}

export async function cancelOrder(orderId: string, locale: string) {
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId);
  revalidatePath(`/${locale}/vendor/orders`);
  revalidatePath(`/${locale}/orders`);
  await sendOrderStatusEmail(orderId, "cancelled");
}
