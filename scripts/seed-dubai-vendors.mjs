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

// Real Dubai Iranian businesses, researched by the founder. Added as PENDING
// (unclaimed) listings — not visible to customers, not orderable — until the
// real owner is contacted and the listing is claimed/approved.
const businesses = [
  // Supermarkets & grocery
  { name: "مینیمارکت اشکنانی", type: "supermarket", area: "Nad Al Sheba 1", description: "Oldest branch of the Eshkenani group; a Farsi-speaking reviewer confirms its Iranian identity." },
  { name: "سوپرمارکت اشکنانی", type: "supermarket", area: "Al Muraqqabat, Deira", description: "A branch under the same Eshkenani group ownership." },
  { name: "هایپرمارکت اشکنانی", type: "supermarket", area: "Al Muraqqabat, Deira", description: "Reviewer: carries Iranian products." },
  { name: "خواربارفروشی اشکنانی", type: "supermarket", area: "Al Karama", description: "Smaller branch of the same group." },
  { name: "سوپرمارکت اشکنانی القصیص", type: "supermarket", area: "Al Qusais", description: "Reviewer notes a wide variety of Iranian products." },
  { name: "سوپرمارکت جدید اشکنانی", type: "supermarket", area: "Al Qusais", description: "Older, long-established branch of the same group." },
  { name: "سوپرمارکت ایرانی اسکی میرجلیلی", type: "supermarket", area: "Jumeirah 1 (Palm Strip Mall)", description: "Explicitly named \"Iranian Supermarket\"; fresh Iranian fruit and vegetables." },
  { name: "مینیمارکت رویا", type: "supermarket", area: "Nad Al Sheba 1", description: "Doogh, lavashak, Iranian herbs and spices." },
  { name: "خواربارفروشی پرایم راش", type: "supermarket", area: "Al Jaddaf", description: "Repeatedly cited as one of the best Iranian supermarkets in Dubai." },
  { name: "سوپرمارکت فرش بازار", type: "supermarket", area: "Umm Suqeim 2", description: "Iranian supermarket connected to an Iranian restaurant." },
  { name: "کارتیمی (فروشگاه آنلاین ایرانی)", type: "supermarket", area: "Business Bay", description: "Iranian online store with a physical branch." },
  { name: "بازار ایرانی", type: "supermarket", area: "Al Sabkha, Deira", description: "Historic multi-vendor bazaar; saffron and Iranian goods." },
  { name: "سوپرمارکت جامجم", type: "supermarket", area: "Business Bay (Safeer Tower 1)", description: "Reviews describe it as having become a general mini-market." },
  { name: "سوپرمارکت جدید جامجم", type: "supermarket", area: "Jumeirah Village Circle", description: "Separate branch, same brand." },
  { name: "سوپرمارکت دماوند", type: "supermarket", area: "Umm Suqeim 2", description: "Reviews confirm Iranian identity, including Iranian caviar." },
  { name: "سوپرمارکت بیمارستان ایرانیان", type: "supermarket", area: "Al Bada (near Iranian Hospital)", description: "General Iranian grocery store, known for fresh strawberries." },
  // Nuts, dried fruit & spices
  { name: "توازو", type: "supermarket", area: "Jumeirah 1", description: "Well-known Iranian nuts brand." },
  { name: "آجیل بادام", type: "supermarket", area: "Al Wasl", description: "Iranian sweets and dried nuts." },
  { name: "تجارت عمومی غلامحسین", type: "supermarket", area: "Al Sabkha, Deira", description: "Fully Iranian-owned; goods imported directly from Iran." },
  { name: "کوخ الزعفران (آجیل)", type: "supermarket", area: "Al Barsha", description: "Sells Iranian almonds; Iranian ownership unconfirmed." },
  // Traditional bakeries
  { name: "نانوایی تهران جدید", type: "bakery", area: "Al Satwa", description: "Iranian lavash bread." },
  { name: "نانوایی ایرانی الشمس", type: "bakery", area: "Al Bada", description: "Tanoor bread; called the best Iranian bread in Dubai." },
  { name: "نانوایی سان", type: "bakery", area: "Al Bada / Al Satwa", description: "Traditional tanoor oven; cheese and sesame bread." },
  { name: "نانوایی دلیشس لوف", type: "bakery", area: "Al Satwa", description: "Called the best lavash bread in Dubai." },
  { name: "نانوایی عبدالخالق احمد بادویی", type: "bakery", area: "Al Jafiliya", description: "Plain and filled Iranian bread; takeaway only." },
  { name: "نانوایی علی فلاح", type: "bakery", area: "Al Twar", description: "Known for lavash and taftoon bread." },
  { name: "نانوایی زعفران", type: "bakery", area: "Al Mizhar 1", description: "Traditional Iranian bread (raqaq, metal-baked); walk-in only." },
  { name: "نانوایی ربدان", type: "bakery", area: "Al Mizhar 1", description: "Iranian bread alongside Emirati bread." },
  { name: "نانوایی نجوم برشاء", type: "bakery", area: "Al Barsha 3", description: "Called the best lavash bread in the neighborhood." },
  { name: "مستر سنگک", type: "bakery", area: "International City", description: "Specializes in sangak bread." },
  { name: "نانوایی یونس", type: "bakery", area: "Al Rashidiya", description: "Popular Iranian bread bakery." },
  { name: "بربری", type: "bakery", area: "Umm Suqeim 3", description: "Fresh barbari bread served with Iranian breakfast." },
  // Sweets shops
  { name: "شیرینی‌فروشی آفرینا", type: "bakery", area: "Jumeirah 1", description: "Homemade sweets; zoolbia bamieh, faloodeh." },
  { name: "شیرینی‌فروشی آفرینا (البرشاء)", type: "bakery", area: "Al Barsha", description: "Second branch." },
  { name: "شیرینی‌فروشی آفرینا (شعبه ۷)", type: "bakery", area: "Mirdif", description: "Third branch." },
  { name: "شیرینی‌فروشی آفرینا (اتحاد مال)", type: "bakery", area: "Union Mall, Muhaisnah", description: "Fourth branch." },
  { name: "شیرینی‌فروشی آفرینا (الممزر)", type: "bakery", area: "Al Mamzar", description: "Fifth branch." },
  { name: "قصر شیرینی ایرانی", type: "bakery", area: "Al Jafiliya", description: "Over 30 years established; faloodeh, saffron ice cream." },
  { name: "شیرینی‌فروشی وایتال", type: "bakery", area: "Al Barsha", description: "Iranian desserts and sweets." },
  { name: "شیرینی‌فروشی شیرین", type: "bakery", area: "Nad Al Hamar", description: "Iranian sweets with a French-influenced style." },
  { name: "شیرینی ایرانی گرند آبشار", type: "bakery", area: "Al Warqa 3", description: "Iranian confectionery." },
  { name: "Sweet Iranian LLC", type: "bakery", area: "Al Ras, Deira", description: "Operating since 1986; known for cream puffs." },
  { name: "کارخانه شیرینی ایرانی", type: "bakery", area: "Al Quoz", description: "Iranian cream-based pastries." },
  { name: "شیرینی ایرانی صدف", type: "bakery", area: "Al Muraqqabat, Deira", description: "Assorted sweets boxes." },
  { name: "شیرینی ایرانی هاله", type: "bakery", area: "Al Mizhar 1", description: "Sweets, nuts, tea, and saffron." },
  // Cafes
  { name: "قهوه‌خانه و نانوایی نادری", type: "cafe", area: "Al Jaddaf", description: "Homemade products; authentic Iranian cafe atmosphere." },
  { name: "فودتراک توت الابیض", type: "cafe", area: "Damac Hills 2", description: "Open-air cafe with an old-Iran nostalgic setting." },
  { name: "کافه‌تریا و رستوران آوای بندر", type: "cafe", area: "Al Karama", description: "A Farsi-speaking reviewer confirms Iranian identity; seafood sandwiches." },
  { name: "کافه و هنرکده مهر و ماه", type: "cafe", area: "Jumeirah 1", description: "Farsi-speaking staff, traditional welcome tea, live music." },
  { name: "کافه شمس", type: "cafe", area: "Nad Al Sheba 1", description: "Reviews mention amazing Iranian sandwiches and homemade sweets." },
  // Restaurants
  { name: "رستوران و کافه توکا", type: "restaurant", area: "Riqqat Al Buteen, Deira", description: "Full Iranian menu with coffee program; open until 3:30am." },
  { name: "رستوران و کافه باران", type: "restaurant", area: "Riqqat Al Buteen, Deira", description: "Authentic Iranian food, saffron tea." },
  { name: "رستوران باشگاه ایرانیان (پارسیان)", type: "restaurant", area: "Oud Metha", description: "Affiliated with the Iranian Club Dubai; full Iranian menu." },
  { name: "رستوران و کافه دنیز بندر", type: "restaurant", area: "Riqqat Al Buteen, Deira", description: "Iranian staff; traditional dishes like kalleh pacheh; open 24 hours." },
  { name: "رستوران و کافه نسرین", type: "restaurant", area: "Al Mateena, Deira", description: "Kalleh pacheh and Iranian breakfast; open 24 hours." },
  { name: "رستوران و کافه نارستان", type: "restaurant", area: "Port Saeed, Deira", description: "Reviewer: best Iranian food I've had in Dubai; live music." },
  { name: "رستوران و کافه کاندو", type: "restaurant", area: "Al Ras, Deira", description: "Authentic Iranian food with shisha." },
  { name: "رستوران و کافه محفل", type: "restaurant", area: "Al Barsha 3", description: "Reviews cite authentic Iranian taste, kebab and stew." },
  { name: "رستوران پرشین لذیذ", type: "restaurant", area: "Dubai Healthcare City", description: "Known as the area's #1 Iranian restaurant." },
  // Catering
  { name: "کیترینگ دلکیت", type: "catering", area: "Al Quoz", description: "Cited as one of the best Iranian caterers in Dubai; kebab, rice, saffron sweets." },
  { name: "کیترینگ چپتر فود پریمیوم", type: "catering", area: "Al Qusais Industrial Area 1", description: "Reviews confirm ghormeh sabzi and gheimeh." },
  { name: "کیترینگ البیت القدیم", type: "catering", area: "Al Quoz Industrial Area 1", description: "Catering with fresh sangak and barbari bread; has its own bakery workshop." },
  { name: "آشپزخانه تعمد", type: "catering", area: "Al Bada, Jumeirah 1", description: "Authentic Iranian food, saffron ice cream, faloodeh; takeaway kitchen and catering." },
  { name: "رستوران فیروزه", type: "catering", area: "Dubai Marina", description: "Dedicated catering page on its website; full Persian ceremony menu." },
  { name: "رستوران کباب پرشین", type: "catering", area: "Al Mina", description: "Open-air catering listed as a core service on its website." },
  { name: "رستوران شایان", type: "catering", area: "Al Muraqqabat, Deira", description: "Confirmed seated dinners for 80 guests; near five-star hotels." },
];

const PLACEHOLDER_EMAIL = "unclaimed-listings@iraniansouq.internal";

async function getOrCreatePlaceholderOwner() {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("full_name", "Unclaimed Directory Listing")
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase.auth.admin.createUser({
    email: PLACEHOLDER_EMAIL,
    password: crypto.randomUUID(),
    email_confirm: true,
    user_metadata: { role: "vendor_owner", full_name: "Unclaimed Directory Listing" },
  });
  if (error) throw error;
  return data.user.id;
}

const ownerId = await getOrCreatePlaceholderOwner();

const { data: alreadyInserted } = await supabase
  .from("vendors")
  .select("name")
  .eq("owner_id", ownerId);
const existingNames = new Set((alreadyInserted ?? []).map((v) => v.name));

const toInsert = businesses
  .filter((b) => !existingNames.has(b.name))
  .map((b) => ({
    owner_id: ownerId,
    name: b.name,
    type: b.type,
    description: b.description,
    address: b.area,
    status: "pending",
  }));

if (toInsert.length === 0) {
  console.log("Nothing to insert — all businesses already seeded.");
  process.exit(0);
}

const { error: insertError } = await supabase
  .from("vendors")
  .insert(toInsert);

if (insertError) {
  console.error("Insert failed:", insertError.message);
  process.exit(1);
}

console.log(`Inserted ${toInsert.length} pending vendor listings (owner: ${ownerId}).`);
