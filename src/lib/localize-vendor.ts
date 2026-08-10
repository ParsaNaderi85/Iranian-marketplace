import type { Vendor } from "@/lib/types";

// The base `name`/`description`/`address` columns hold the original research
// text (Farsi). When a translation exists for the current locale it's used
// instead, falling back to the base columns otherwise.
export function localizeVendor(vendor: Vendor, locale: string) {
  const t = vendor.translations?.[locale];
  return {
    ...vendor,
    name: t?.name ?? vendor.name,
    description: t?.description ?? vendor.description,
    address: t?.address ?? vendor.address,
  };
}
