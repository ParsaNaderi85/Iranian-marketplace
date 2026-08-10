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

// Only seeding reviews for businesses where the original research actually
// captured a quoted customer opinion — not inventing sentiment for the rest.
const REVIEWS = [
  { vendor: "خواربارفروشی پرایم راش", comment: "بهترین سوپرمارکت ایرانی دبی", rating: 5 },
  { vendor: "سوپرمارکت اشکنانی القصیص", comment: "تنوع بالای محصولات ایرانی", rating: 4 },
  { vendor: "نانوایی ایرانی الشمس", comment: "بهترین نان ایرانی دبی", rating: 5 },
  { vendor: "نانوایی دلیشس لوف", comment: "بهترین نان لواش دبی", rating: 5 },
  { vendor: "نانوایی نجوم برشاء", comment: "بهترین نان لواش محله", rating: 5 },
  { vendor: "رستوران و کافه نارستان", comment: "بهترین غذای ایرانی که در دبی خورده‌ام", rating: 5 },
  { vendor: "رستوران و کافه محفل", comment: "طعم اصیل ایرانی", rating: 4 },
  { vendor: "کافه شمس", comment: "ساندویچ‌های ایرانی فوق‌العاده", rating: 5 },
  { vendor: "رستوران پرشین لذیذ", comment: "رستوران ایرانی شماره ۱ منطقه", rating: 5 },
  { vendor: "کیترینگ دلکیت", comment: "یکی از بهترین کیترینگ‌های ایرانی دبی", rating: 5 },
];

const { data: vendors, error } = await supabase.from("vendors").select("id, name");
if (error) throw error;

const { data: existing } = await supabase.from("reviews").select("vendor_id");
const alreadyReviewed = new Set((existing ?? []).map((r) => r.vendor_id));

let inserted = 0;
for (const r of REVIEWS) {
  const vendor = vendors.find((v) => v.name === r.vendor);
  if (!vendor || alreadyReviewed.has(vendor.id)) continue;

  const { error: insertError } = await supabase.from("reviews").insert({
    vendor_id: vendor.id,
    customer_id: null,
    reviewer_name: null,
    rating: r.rating,
    comment: r.comment,
  });
  if (insertError) {
    console.error(`Failed for ${r.vendor}:`, insertError.message);
    continue;
  }
  inserted++;
}

console.log(`Inserted ${inserted} reviews.`);
