import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

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

console.log("Checking migration 018 (atomic stock decrement)...");
const { error: rpcError } = await supabase.rpc("decrement_stock_for_order", {
  items: [],
});
if (rpcError) {
  console.log(`  NOT APPLIED — ${rpcError.message}`);
} else {
  console.log("  APPLIED — decrement_stock_for_order() exists and runs cleanly on empty input");
}

console.log("\nChecking migration 017 (vendor_staff removal)...");
const { error: tableError } = await supabase
  .from("vendor_staff")
  .select("*")
  .limit(1);
if (tableError) {
  console.log(`  APPLIED — vendor_staff table is gone (${tableError.message})`);
} else {
  console.log("  NOT APPLIED — vendor_staff table still exists");
}
