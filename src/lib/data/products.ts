import { createClient } from "@/lib/supabase/server";
import type { Product, Category, VendorType } from "@/lib/types";

export async function getAllProductsForVendor(
  vendorId: string,
): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  return (data as Product[]) ?? [];
}

export async function getCategoriesForType(
  vendorType: VendorType,
): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("vendor_type", vendorType)
    .order("name");

  return (data as Category[]) ?? [];
}
