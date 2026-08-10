import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { localizeVendor } from "@/lib/localize-vendor";
import { normalizeProduct } from "@/lib/data/products";
import type { Vendor, VendorType, Product } from "@/lib/types";

export async function getApprovedVendors(
  type: VendorType,
  filters?: { q?: string; area?: string },
): Promise<Vendor[]> {
  const supabase = await createClient();
  let query = supabase
    .from("vendors")
    .select("*")
    .eq("status", "approved")
    .eq("type", type);

  if (filters?.q) {
    const escaped = filters.q.replace(/[%,()]/g, "");
    query = query.or(
      `name.ilike.%${escaped}%,translations->en->>name.ilike.%${escaped}%,translations->ar->>name.ilike.%${escaped}%`,
    );
  }
  if (filters?.area) {
    query = query.eq("address", filters.area);
  }

  const [{ data }, locale] = await Promise.all([
    query.order("name"),
    getLocale(),
  ]);
  return ((data as Vendor[]) ?? []).map((v) => localizeVendor(v, locale));
}

export async function getVendorAreas(
  type: VendorType,
): Promise<{ value: string; label: string }[]> {
  const supabase = await createClient();
  const [{ data }, locale] = await Promise.all([
    supabase
      .from("vendors")
      .select("address, translations")
      .eq("status", "approved")
      .eq("type", type)
      .not("address", "is", null),
    getLocale(),
  ]);

  const seen = new Map<string, string>();
  for (const v of data ?? []) {
    const address = v.address as string;
    const translations = v.translations as Vendor["translations"];
    const label = translations?.[locale]?.address ?? address;
    if (!seen.has(address)) seen.set(address, label);
  }
  return Array.from(seen, ([value, label]) => ({ value, label })).sort(
    (a, b) => a.label.localeCompare(b.label),
  );
}

export async function getFeaturedVendors(limit = 8): Promise<Vendor[]> {
  const supabase = await createClient();
  const [{ data }, locale] = await Promise.all([
    supabase
      .from("vendors")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit),
    getLocale(),
  ]);

  return ((data as Vendor[]) ?? []).map((v) => localizeVendor(v, locale));
}

export async function getTopRatedVendors(
  limit = 8,
  type?: VendorType,
): Promise<(Vendor & { rating: { average: number; count: number } })[]> {
  const supabase = await createClient();
  let query = supabase.from("vendors").select("*").eq("status", "approved");
  if (type) query = query.eq("type", type);

  const [{ data: vendors }, locale] = await Promise.all([
    query,
    getLocale(),
  ]);
  if (!vendors || vendors.length === 0) return [];

  const { data: reviewRows } = await supabase
    .from("reviews")
    .select("vendor_id, rating")
    .in(
      "vendor_id",
      vendors.map((v) => v.id),
    );

  const grouped: Record<string, number[]> = {};
  for (const r of reviewRows ?? []) {
    (grouped[r.vendor_id] ??= []).push(r.rating);
  }

  return (vendors as Vendor[])
    .map((v) => {
      const ratings = grouped[v.id] ?? [];
      const average = ratings.length
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;
      return {
        ...localizeVendor(v, locale),
        rating: { average, count: ratings.length },
      };
    })
    .filter((v) => v.rating.count > 0)
    .sort((a, b) => b.rating.average - a.rating.average || b.rating.count - a.rating.count)
    .slice(0, limit);
}

export async function getApprovedVendorById(
  vendorId: string,
): Promise<Vendor | null> {
  const supabase = await createClient();
  const [{ data }, locale] = await Promise.all([
    supabase
      .from("vendors")
      .select("*")
      .eq("id", vendorId)
      .eq("status", "approved")
      .single(),
    getLocale(),
  ]);

  return data ? localizeVendor(data as Vendor, locale) : null;
}

export async function getVendorById(vendorId: string): Promise<Vendor | null> {
  const supabase = await createClient();
  const [{ data }, locale] = await Promise.all([
    supabase.from("vendors").select("*").eq("id", vendorId).maybeSingle(),
    getLocale(),
  ]);
  return data ? localizeVendor(data as Vendor, locale) : null;
}

export async function getAvailableProductsForVendor(
  vendorId: string,
): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("vendor_id", vendorId)
    .eq("is_available", true)
    .order("created_at");

  return ((data as Product[]) ?? []).map(normalizeProduct);
}

export async function getAllVendors(): Promise<Vendor[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vendors")
    .select("*")
    .order("created_at", { ascending: false });

  return (data as Vendor[]) ?? [];
}

export async function getVendorByOwnerId(
  ownerId: string,
): Promise<Vendor | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vendors")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();

  return (data as Vendor | null) ?? null;
}
