import { createClient } from "@/lib/supabase/server";

export type VendorCustomer = {
  customerId: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
};

export async function getCustomersForVendor(
  vendorId: string,
): Promise<VendorCustomer[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("customer_id, total_aed, status, created_at, profiles(full_name)")
    .eq("vendor_id", vendorId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  const grouped = new Map<string, VendorCustomer>();
  for (const row of data ?? []) {
    const existing = grouped.get(row.customer_id);
    const name =
      (row.profiles as unknown as { full_name: string | null } | null)
        ?.full_name ?? "—";
    if (existing) {
      existing.orderCount++;
      existing.totalSpent += row.total_aed;
    } else {
      grouped.set(row.customer_id, {
        customerId: row.customer_id,
        name,
        orderCount: 1,
        totalSpent: row.total_aed,
        lastOrderAt: row.created_at,
      });
    }
  }

  return Array.from(grouped.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}
