import { createClient } from "@/lib/supabase/server";
import type { VendorApplication } from "@/lib/types";

export async function getVendorApplications(): Promise<VendorApplication[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vendor_applications")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as VendorApplication[]) ?? [];
}
