import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { localizeVendor } from "@/lib/localize-vendor";
import type { Vendor } from "@/lib/types";

export async function isVendorFavorited(
  customerId: string,
  vendorId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("customer_id", customerId)
    .eq("vendor_id", vendorId)
    .maybeSingle();
  return !!data;
}

export async function getFavoriteVendors(customerId: string): Promise<Vendor[]> {
  const supabase = await createClient();
  const [{ data }, locale] = await Promise.all([
    supabase
      .from("favorites")
      .select("vendors(*)")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
    getLocale(),
  ]);

  type Row = { vendors: Vendor | Vendor[] | null };
  const vendors = ((data as Row[]) ?? [])
    .map((row) => (Array.isArray(row.vendors) ? row.vendors[0] : row.vendors))
    .filter((v): v is Vendor => v != null);

  return vendors.map((v) => localizeVendor(v, locale));
}
