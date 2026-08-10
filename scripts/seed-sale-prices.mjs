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

const { data: products, error } = await supabase
  .from("products")
  .select("id, price_aed")
  .is("sale_price_aed", null);
if (error) throw error;

// Put ~20% of products on sale, at a 15-30% discount.
const onSale = products.filter(() => Math.random() < 0.2);

let updated = 0;
for (const p of onSale) {
  const discount = 0.15 + Math.random() * 0.15;
  const salePrice = Math.round(p.price_aed * (1 - discount) * 100) / 100;
  const { error: updateError } = await supabase
    .from("products")
    .update({ sale_price_aed: salePrice })
    .eq("id", p.id);
  if (!updateError) updated++;
}

console.log(`Put ${updated} of ${products.length} products on sale.`);
