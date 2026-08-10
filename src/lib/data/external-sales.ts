import { createClient } from "@/lib/supabase/server";
import type { ExternalSale } from "@/lib/types";

export async function getExternalSalesForVendor(
  vendorId: string,
): Promise<ExternalSale[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("external_sales")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("sale_date", { ascending: false });

  return (data as ExternalSale[]) ?? [];
}
