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

// Representative catalog items per vendor type — used to give each seeded
// business a plausible-looking product list for demo purposes. These are NOT
// each business's real menu/prices (we don't have that), just realistic
// placeholders per category.
const CATALOG = {
  supermarket: [
    ["Basmati Rice (5kg)", "Rice & Grains", 45],
    ["Iranian Saffron (2g)", "Spices & Herbs", 35],
    ["Sangak Bread", "Bread & Bakery", 6],
    ["Barbari Bread", "Bread & Bakery", 7],
    ["Doogh (Yogurt Drink) 1.5L", "Dairy", 12],
    ["Iranian Feta Cheese (400g)", "Dairy", 22],
    ["Pistachios (500g)", "Nuts & Dried Fruits", 55],
    ["Dried Barberries / Zereshk (250g)", "Nuts & Dried Fruits", 28],
    ["Sumac Powder (200g)", "Spices & Herbs", 15],
    ["Rosewater (500ml)", "Beverages", 18],
    ["Frozen Ghormeh Sabzi Mix", "Frozen Foods", 20],
    ["Golestan Black Tea (450g)", "Beverages", 25],
    ["Iranian Halva (500g)", "Nuts & Dried Fruits", 24],
    ["Lavashak Fruit Roll (300g)", "Nuts & Dried Fruits", 14],
  ],
  restaurant: [
    ["Joojeh Kebab (Chicken)", "Kebab & Grill", 42],
    ["Kubideh Kebab (Beef)", "Kebab & Grill", 45],
    ["Ghormeh Sabzi", "Stews (Khoresht)", 48],
    ["Fesenjan", "Stews (Khoresht)", 52],
    ["Gheimeh", "Stews (Khoresht)", 44],
    ["Mast-o-Khiar", "Appetizers", 18],
    ["Kashk-e Bademjan", "Appetizers", 22],
    ["Zereshk Polo ba Morgh", "Kebab & Grill", 46],
    ["Faloodeh", "Desserts", 16],
    ["Saffron Ice Cream", "Desserts", 18],
    ["Doogh", "Drinks", 10],
    ["Saffron Tea", "Drinks", 12],
    ["Ash Reshteh", "Stews (Khoresht)", 24],
  ],
  bakery: [
    ["Fresh Barbari Bread", "Fresh Bread", 7],
    ["Fresh Sangak Bread", "Fresh Bread", 6],
    ["Fresh Lavash Bread", "Fresh Bread", 5],
    ["Zoolbia", "Cookies & Sweets", 20],
    ["Bamieh", "Cookies & Sweets", 20],
    ["Persian Baklava (500g)", "Pastries", 38],
    ["Saffron Cake Slice", "Cakes", 16],
    ["Walnut Cake Slice", "Cakes", 16],
    ["Nan-e Berenji (Rice Cookies, box)", "Cookies & Sweets", 24],
    ["Nan-e Nokhodchi (box)", "Cookies & Sweets", 24],
    ["Koloocheh (box)", "Cookies & Sweets", 26],
    ["Cream Puff (Shirini Khamei, box)", "Pastries", 30],
    ["Saffron Rice Pudding (Sheer Berenj)", "Pastries", 18],
  ],
  cafe: [
    ["Saffron Tea", "Hot Drinks", 14],
    ["Persian Coffee", "Hot Drinks", 15],
    ["Doogh", "Cold Drinks", 10],
    ["Sekanjabin Sharbat", "Cold Drinks", 13],
    ["Faloodeh", "Desserts", 16],
    ["Saffron Ice Cream", "Desserts", 18],
    ["Cream Puff", "Pastries & Snacks", 12],
    ["Iranian-style Sandwich", "Pastries & Snacks", 22],
    ["Persian Baklava Slice", "Desserts", 14],
    ["Rosewater Lemonade", "Cold Drinks", 15],
    ["Cardamom Tea", "Hot Drinks", 14],
    ["Zoolbia Bamieh (box)", "Desserts", 22],
  ],
  catering: [
    ["Mixed Kebab Platter (serves 10)", "Platters", 320],
    ["Ghormeh Sabzi Tray (serves 10)", "Platters", 280],
    ["Zereshk Polo ba Morgh Tray (serves 10)", "Platters", 300],
    ["Saffron Rice Tray, Large", "Platters", 180],
    ["Persian Wedding Package (per person)", "Event Packages", 95],
    ["Corporate Lunch Package (per person)", "Event Packages", 65],
    ["Mixed Appetizer Platter", "Platters", 150],
    ["Assorted Dessert Platter", "Platters", 140],
    ["Custom Menu Consultation", "Custom Orders", 0],
    ["Full Ceremony Catering Package (per person)", "Event Packages", 120],
  ],
};

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function jitterPrice(base) {
  if (base === 0) return 0;
  const pct = 0.9 + Math.random() * 0.2; // +/-10%
  return Math.round(base * pct * 100) / 100;
}

const { data: vendors, error: vendorsError } = await supabase
  .from("vendors")
  .select("id, name, type");
if (vendorsError) throw vendorsError;

const { data: categories, error: categoriesError } = await supabase
  .from("categories")
  .select("id, name, vendor_type");
if (categoriesError) throw categoriesError;

const categoryId = (vendorType, name) =>
  categories.find((c) => c.vendor_type === vendorType && c.name === name)?.id ?? null;

const { data: existingProducts } = await supabase
  .from("products")
  .select("vendor_id");
const vendorsWithProducts = new Set((existingProducts ?? []).map((p) => p.vendor_id));

const rows = [];
for (const vendor of vendors) {
  if (vendorsWithProducts.has(vendor.id)) continue;
  const catalog = CATALOG[vendor.type];
  if (!catalog) continue;
  const picks = shuffled(catalog).slice(0, 10);
  for (const [name, categoryName, basePrice] of picks) {
    rows.push({
      vendor_id: vendor.id,
      category_id: categoryId(vendor.type, categoryName),
      name,
      price_aed: jitterPrice(basePrice),
      is_available: true,
    });
  }
}

if (rows.length === 0) {
  console.log("Nothing to insert — all vendors already have products.");
  process.exit(0);
}

// Insert in batches to stay well under request size limits.
const BATCH = 200;
let inserted = 0;
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { error } = await supabase.from("products").insert(batch);
  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }
  inserted += batch.length;
}

console.log(`Inserted ${inserted} products across ${vendors.length - vendorsWithProducts.size} vendors.`);
