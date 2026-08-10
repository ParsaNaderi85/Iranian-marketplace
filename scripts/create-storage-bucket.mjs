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

const buckets = [
  { id: "product-images", public: true },
  { id: "vendor-logos", public: true },
];

for (const b of buckets) {
  const { data: existing } = await supabase.storage.getBucket(b.id);
  if (existing) {
    console.log(`Bucket "${b.id}" already exists.`);
    continue;
  }
  const { error } = await supabase.storage.createBucket(b.id, {
    public: b.public,
    fileSizeLimit: "5MB",
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  });
  if (error) {
    console.error(`Failed to create bucket "${b.id}":`, error.message);
    process.exit(1);
  }
  console.log(`Created bucket "${b.id}".`);
}
