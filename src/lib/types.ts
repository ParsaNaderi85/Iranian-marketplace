export type UserRole = "customer" | "vendor_owner" | "admin";
export type VendorType =
  | "supermarket"
  | "restaurant"
  | "bakery"
  | "cafe"
  | "catering";

export const VENDOR_TYPES: VendorType[] = [
  "supermarket",
  "restaurant",
  "bakery",
  "cafe",
  "catering",
];

// URL segment for each vendor type's browse page, e.g. /en/bakeries
export const VENDOR_TYPE_SLUGS: Record<VendorType, string> = {
  supermarket: "supermarkets",
  restaurant: "restaurants",
  bakery: "bakeries",
  cafe: "cafes",
  catering: "catering",
};
export type VendorStatus = "pending" | "approved" | "suspended";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";
export type PaymentMethod = "online" | "cod";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  preferred_locale: string;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
};

export type Coupon = {
  id: string;
  owner_id: string;
  code: string;
  discount_percent: number;
  status: "active" | "used";
  source: string;
  used_at: string | null;
  used_on_order_id: string | null;
  created_at: string;
};

export type VendorTranslation = {
  name?: string;
  description?: string;
  address?: string;
};

export type Vendor = {
  id: string;
  owner_id: string;
  name: string;
  type: VendorType;
  description: string | null;
  logo_url: string | null;
  address: string | null;
  status: VendorStatus;
  commission_rate: number;
  delivers_self: boolean;
  translations: Record<string, VendorTranslation> | null;
  created_at: string;
};

export type Review = {
  id: string;
  vendor_id: string;
  customer_id: string | null;
  reviewer_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  vendor_type: VendorType;
};

export type Product = {
  id: string;
  vendor_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price_aed: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
};

export type CustomerAddress = {
  id: string;
  customer_id: string;
  label: string;
  line1: string;
  area: string;
  created_at: string;
};

export type Order = {
  id: string;
  customer_id: string;
  vendor_id: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal_aed: number;
  commission_amount_aed: number;
  total_aed: number;
  delivery_line1: string;
  delivery_area: string;
  stripe_checkout_session_id: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  name_snapshot: string;
  price_snapshot_aed: number;
  quantity: number;
};

export type CartItem = {
  productId: string;
  name: string;
  priceAed: number;
  quantity: number;
};

export type Cart = {
  vendorId: string;
  vendorName: string;
  items: CartItem[];
};
