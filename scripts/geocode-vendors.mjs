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

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "iranian-marketplace-dev (contact: admin@example.com)" },
  });
  if (!res.ok) return null;
  const results = await res.json();
  if (!results.length) return null;
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const { data: vendors, error } = await supabase
  .from("vendors")
  .select("id, address")
  .is("latitude", null)
  .not("address", "is", null);
if (error) throw error;

// Geocode each unique area once (Nominatim usage policy: max 1 req/sec).
const areaCache = new Map();
let geocoded = 0;
let failed = 0;

for (const v of vendors) {
  const area = v.address;
  if (!areaCache.has(area)) {
    const coords = await geocode(`${area}, Dubai, United Arab Emirates`);
    areaCache.set(area, coords);
    await sleep(1100);
  }
  const coords = areaCache.get(area);
  if (!coords) {
    failed++;
    continue;
  }
  const { error: updateError } = await supabase
    .from("vendors")
    .update({ latitude: coords.lat, longitude: coords.lng })
    .eq("id", v.id);
  if (!updateError) geocoded++;
}

console.log(`Geocoded ${geocoded} vendors (${areaCache.size} unique areas looked up, ${failed} failed).`);
