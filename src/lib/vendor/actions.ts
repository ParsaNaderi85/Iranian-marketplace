"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";
import { getVendorByOwnerId } from "@/lib/data/vendors";
import { VENDOR_TYPES, type OrderStatus, type VendorType } from "@/lib/types";

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
    .select("status")
    .eq("id", orderId)
    .single();
  if (!order) return;

  const next = nextStatusMap[order.status as OrderStatus];
  if (!next) return;

  await supabase.from("orders").update({ status: next }).eq("id", orderId);
  revalidatePath(`/${locale}/vendor/orders`);
  revalidatePath(`/${locale}/orders`);
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
}
