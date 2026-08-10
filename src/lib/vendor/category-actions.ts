"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getVendorByOwnerId } from "@/lib/data/vendors";
import type { ActionState } from "@/lib/vendor/actions";

const MAX_BEST_SELLERS = 5;

export async function createVendorCategory(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauthorized" };

  const vendor = await getVendorByOwnerId(user.id);
  if (!vendor) return { error: "noVendor" };

  const parsed = z.string().min(1).max(60).safeParse(formData.get("name"));
  if (!parsed.success) return { error: "invalid" };

  const locale = String(formData.get("locale") ?? "en");
  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    name: parsed.data,
    vendor_type: vendor.type,
    vendor_id: vendor.id,
  });

  if (error) return { error: "invalid" };

  revalidatePath(`/${locale}/vendor/products`);
  return undefined;
}

export async function deleteVendorCategory(categoryId: string, locale: string) {
  const user = await getCurrentUser();
  if (!user) return;
  const vendor = await getVendorByOwnerId(user.id);
  if (!vendor) return;

  const supabase = await createClient();
  await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("vendor_id", vendor.id);

  revalidatePath(`/${locale}/vendor/products`);
}

export async function toggleBestSeller(
  productId: string,
  makeBestSeller: boolean,
  locale: string,
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauthorized" };
  const vendor = await getVendorByOwnerId(user.id);
  if (!vendor) return { error: "noVendor" };

  const supabase = await createClient();

  if (makeBestSeller) {
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("vendor_id", vendor.id)
      .eq("is_best_seller", true);
    if ((count ?? 0) >= MAX_BEST_SELLERS) {
      return { error: "bestSellerLimit" };
    }
  }

  await supabase
    .from("products")
    .update({ is_best_seller: makeBestSeller })
    .eq("id", productId)
    .eq("vendor_id", vendor.id);

  revalidatePath(`/${locale}/vendor/products`);
  return {};
}
