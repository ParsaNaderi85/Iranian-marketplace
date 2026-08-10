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

const email = process.argv[2];
if (!email) {
  console.error("Usage: node check-and-confirm-test-user.mjs <email>");
  process.exit(1);
}

const { data, error } = await supabase.auth.admin.listUsers();
if (error) throw error;

const user = data.users.find((u) => u.email === email);
if (!user) {
  console.log("No such user found.");
  process.exit(0);
}

console.log("Found user:", user.id, "confirmed:", !!user.email_confirmed_at);

if (!user.email_confirmed_at) {
  const { error: confirmError } = await supabase.auth.admin.updateUserById(
    user.id,
    { email_confirm: true },
  );
  if (confirmError) throw confirmError;
  console.log("Confirmed email for", email);
}
