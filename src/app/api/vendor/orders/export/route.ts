import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { getVendorByOwnerId } from "@/lib/data/vendors";
import { getOrdersForVendor } from "@/lib/data/orders";

function csvEscape(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const vendor = await getVendorByOwnerId(profile.id);
  if (!vendor) {
    return NextResponse.json({ error: "notFound" }, { status: 404 });
  }

  const orders = await getOrdersForVendor(vendor.id);

  const header = [
    "order_id",
    "date",
    "status",
    "payment_method",
    "items",
    "subtotal_aed",
    "commission_aed",
    "delivery_fee_aed",
    "total_aed",
    "net_earnings_aed",
  ];

  const rows = orders.map((o) => {
    const items = o.order_items
      .map((i) => `${i.quantity}x ${i.name_snapshot}`)
      .join("; ");
    const netEarnings = o.subtotal_aed - o.commission_amount_aed;
    return [
      o.id,
      new Date(o.created_at).toISOString().slice(0, 10),
      o.status,
      o.payment_method,
      items,
      o.subtotal_aed.toFixed(2),
      o.commission_amount_aed.toFixed(2),
      o.delivery_fee_aed.toFixed(2),
      o.total_aed.toFixed(2),
      netEarnings.toFixed(2),
    ];
  });

  const csv = [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${vendor.id.slice(0, 8)}.csv"`,
    },
  });
}
