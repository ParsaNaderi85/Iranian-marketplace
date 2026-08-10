import { createClient } from "@/lib/supabase/server";
import type { Campaign } from "@/lib/types";

export async function getActiveCampaign(): Promise<Campaign | null> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("active", true)
    .lte("starts_at", now)
    .gte("ends_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Campaign | null) ?? null;
}

export async function getAllCampaigns(): Promise<Campaign[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Campaign[]) ?? [];
}
