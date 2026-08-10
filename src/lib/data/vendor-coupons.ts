import { createClient } from "@/lib/supabase/server";

export type VendorCoupon = {
  id: string;
  vendor_id: string;
  code: string;
  discount_percent: number;
  active: boolean;
  created_at: string;
};

export async function getVendorCoupons(vendorId: string): Promise<VendorCoupon[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vendor_coupons")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });
  return (data as VendorCoupon[]) ?? [];
}
