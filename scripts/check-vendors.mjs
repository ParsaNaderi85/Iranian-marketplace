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

const { data, count, error } = await supabase
  .from("vendors")
  .select("status, type", { count: "exact" });

if (error) {
  console.error(error);
  process.exit(1);
}

const byStatus = {};
for (const v of data) byStatus[v.status] = (byStatus[v.status] || 0) + 1;
console.log("Total vendors:", count);
console.log("By status:", byStatus);
