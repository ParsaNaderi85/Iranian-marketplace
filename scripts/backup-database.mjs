import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    }),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

// Every table in supabase/schema.sql plus later migrations (vendor_coupons,
// favorites, external_sales) that never made it back into schema.sql.
// vendor_staff is intentionally excluded — dropped in migration 017.
const TABLES = [
  "profiles",
  "vendors",
  "categories",
  "products",
  "customer_addresses",
  "orders",
  "order_items",
  "reviews",
  "coupons",
  "vendor_coupons",
  "vendor_applications",
  "campaigns",
  "vendor_payouts",
  "group_orders",
  "group_order_items",
  "favorites",
  "external_sales",
];

const PAGE_SIZE = 1000;

async function dumpTable(table) {
  const rows = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, from + PAGE_SIZE - 1);
    if (error) {
      console.warn(`  ! ${table}: ${error.message} (skipped)`);
      return null;
    }
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

const backup = {};
console.log("Dumping tables...");
for (const table of TABLES) {
  const rows = await dumpTable(table);
  if (rows === null) continue;
  backup[table] = rows;
  console.log(`  - ${table}: ${rows.length} rows`);
}

mkdirSync("backups", { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);
const outPath = `backups/backup-${stamp}.json`;
writeFileSync(outPath, JSON.stringify(backup, null, 2));
console.log(`\nSaved to ${outPath}`);
