"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getVendorByOwnerId } from "@/lib/data/vendors";
import type { ActionState } from "@/lib/vendor/actions";

const externalSaleSchema = z.object({
  amountAed: z.coerce.number().min(0),
  description: z.string().optional(),
  channel: z.enum(["whatsapp", "instagram", "walk_in", "other"]),
  saleDate: z.string().min(1),
  locale: z.string(),
});

export async function addExternalSale(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauthorized" };

  const vendor = await getVendorByOwnerId(user.id);
  if (!vendor) return { error: "noVendor" };

  const parsed = externalSaleSchema.safeParse({
    amountAed: formData.get("amountAed"),
    description: formData.get("description") || undefined,
    channel: formData.get("channel"),
    saleDate: formData.get("saleDate"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) return { error: "invalid" };

  const supabase = await createClient();
  const { error } = await supabase.from("external_sales").insert({
    vendor_id: vendor.id,
    amount_aed: parsed.data.amountAed,
    description: parsed.data.description ?? null,
    channel: parsed.data.channel,
    sale_date: parsed.data.saleDate,
  });

  if (error) return { error: "invalid" };

  revalidatePath(`/${parsed.data.locale}/vendor/sales`);
  revalidatePath(`/${parsed.data.locale}/vendor/analytics`);
  return undefined;
}

export async function deleteExternalSale(saleId: string, locale: string) {
  const user = await getCurrentUser();
  if (!user) return;
  const vendor = await getVendorByOwnerId(user.id);
  if (!vendor) return;

  const supabase = await createClient();
  await supabase
    .from("external_sales")
    .delete()
    .eq("id", saleId)
    .eq("vendor_id", vendor.id);

  revalidatePath(`/${locale}/vendor/sales`);
  revalidatePath(`/${locale}/vendor/analytics`);
}
