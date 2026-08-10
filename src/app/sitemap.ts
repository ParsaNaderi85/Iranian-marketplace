import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";
import { VENDOR_TYPE_SLUGS, VENDOR_TYPES } from "@/lib/types";

const STATIC_PATHS = [
  "",
  ...VENDOR_TYPES.map((t) => VENDOR_TYPE_SLUGS[t]),
  "about",
  "faq",
  "terms",
  "privacy",
  "vendor-agreement",
  "refer",
  "become-a-vendor",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data: vendors } = await supabase
    .from("vendors")
    .select("id, created_at")
    .eq("status", "approved");

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${siteUrl}/${locale}${path ? `/${path}` : ""}`,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : 0.6,
      });
    }
    for (const vendor of vendors ?? []) {
      entries.push({
        url: `${siteUrl}/${locale}/vendors/${vendor.id}`,
        lastModified: vendor.created_at,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  }

  return entries;
}
