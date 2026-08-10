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
  loyalty_points: number;
  created_at: string;
};

export type Campaign = {
  id: string;
  title: string;
  message: string;
  discount_percent: number | null;
  starts_at: string;
  ends_at: string;
  active: boolean;
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

export type VendorApplicationStatus = "new" | "contacted" | "approved" | "rejected";

export type VendorApplication = {
  id: string;
  business_name: string;
  business_type: VendorType;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  area: string | null;
  message: string | null;
  status: VendorApplicationStatus;
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
  banner_url: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  status: VendorStatus;
  commission_rate: number;
  delivery_fee_aed: number;
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
  vendor_id: string | null;
};

export type Product = {
  id: string;
  vendor_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price_aed: number;
  sale_price_aed: number | null;
  cost_price_aed: number | null;
  stock_quantity: number | null;
  low_stock_threshold: number;
  image_url: string | null;
  is_available: boolean;
  is_best_seller: boolean;
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
  delivery_fee_aed: number;
  total_aed: number;
  delivery_line1: string;
  delivery_area: string;
  delivery_lat: number | null;
  delivery_lng: number | null;
  stripe_checkout_session_id: string | null;
  paid_out: boolean;
  created_at: string;
};

export type VendorPayout = {
  id: string;
  vendor_id: string;
  amount_aed: number;
  order_count: number;
  note: string | null;
  created_at: string;
};

export type GroupOrderStatus = "open" | "checked_out" | "cancelled";

export type GroupOrder = {
  id: string;
  organizer_id: string;
  vendor_id: string;
  status: GroupOrderStatus;
  order_id: string | null;
  created_at: string;
};

export type GroupOrderItem = {
  id: string;
  group_order_id: string;
  contributor_id: string;
  contributor_name: string;
  product_id: string;
  quantity: number;
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

export type ExternalSaleChannel = "whatsapp" | "instagram" | "walk_in" | "other";

export type ExternalSale = {
  id: string;
  vendor_id: string;
  amount_aed: number;
  description: string | null;
  channel: ExternalSaleChannel;
  sale_date: string;
  created_at: string;
};

export type Favorite = {
  id: string;
  customer_id: string;
  vendor_id: string;
  created_at: string;
};
