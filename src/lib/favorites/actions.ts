"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function toggleFavorite(
  vendorId: string,
  isFavorite: boolean,
  locale: string,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "unauthorized" };

  const supabase = await createClient();
  if (isFavorite) {
    await supabase
      .from("favorites")
      .delete()
      .eq("customer_id", user.id)
      .eq("vendor_id", vendorId);
  } else {
    await supabase
      .from("favorites")
      .insert({ customer_id: user.id, vendor_id: vendorId });
  }
  revalidatePath(`/${locale}/vendors/${vendorId}`);
  revalidatePath(`/${locale}/favorites`);
}
