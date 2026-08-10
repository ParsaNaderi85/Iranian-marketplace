import { createClient } from "@/lib/supabase/server";
import { localizeVendor } from "@/lib/localize-vendor";
import type { Locale } from "@/i18n/routing";
import type { Vendor } from "@/lib/types";

export type AssistantContextResult = {
  vendors: { id: string; name: string; type: string; address: string | null }[];
  products: {
    id: string;
    name: string;
    priceAed: number;
    vendorId: string;
    vendorName: string;
  }[];
};

/**
 * Best-effort keyword search used to ground the shopping assistant's
 * answers in real listings instead of letting it invent vendors/products.
 */
export async function searchMarketplaceForAssistant(
  query: string,
  locale: Locale,
): Promise<AssistantContextResult> {
  const supabase = await createClient();
  const escaped = query.replace(/[%,()]/g, "").slice(0, 100);
  if (!escaped) return { vendors: [], products: [] };

  const [{ data: vendorRows }, { data: productRows }] = await Promise.all([
    supabase
      .from("vendors")
      .select("id, name, type, address, translations")
      .eq("status", "approved")
      .or(
        `name.ilike.%${escaped}%,translations->en->>name.ilike.%${escaped}%,translations->ar->>name.ilike.%${escaped}%,type.ilike.%${escaped}%`,
      )
      .limit(5),
    supabase
      .from("products")
      .select("id, name, price_aed, sale_price_aed, vendor_id, vendors!inner(name, status)")
      .eq("is_available", true)
      .eq("vendors.status", "approved")
      .ilike("name", `%${escaped}%`)
      .limit(5),
  ]);

  const vendors = ((vendorRows as Vendor[]) ?? []).map((v) => {
    const localized = localizeVendor(v, locale);
    return {
      id: localized.id,
      name: localized.name,
      type: localized.type,
      address: localized.address,
    };
  });

  type ProductSearchRow = {
    id: string;
    name: string;
    price_aed: number;
    sale_price_aed: number | null;
    vendor_id: string;
    vendors: { name: string } | { name: string }[] | null;
  };

  const products = ((productRows as ProductSearchRow[]) ?? []).map((p) => {
    const vendor = Array.isArray(p.vendors) ? p.vendors[0] : p.vendors;
    return {
      id: p.id,
      name: p.name,
      priceAed: p.sale_price_aed ?? p.price_aed,
      vendorId: p.vendor_id,
      vendorName: vendor?.name ?? "",
    };
  });

  return { vendors, products };
}
