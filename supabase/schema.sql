-- Iranian Souq marketplace schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('customer', 'vendor_owner', 'admin');
create type vendor_type as enum ('supermarket', 'restaurant', 'bakery', 'cafe', 'catering');
create type vendor_status as enum ('pending', 'approved', 'suspended');
create type order_status as enum ('pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled');
create type payment_method as enum ('online', 'cod');
create type payment_status as enum ('unpaid', 'paid', 'refunded');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'customer',
  full_name text,
  phone text,
  preferred_locale text not null default 'en',
  referral_code text unique,
  referred_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create table vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  type vendor_type not null,
  description text,
  logo_url text,
  address text,
  status vendor_status not null default 'pending',
  commission_rate numeric(5, 2) not null default 15.00,
  delivers_self boolean not null default true,
  translations jsonb,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vendor_type vendor_type not null
);

create table products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors (id) on delete cascade,
  category_id uuid references categories (id) on delete set null,
  name text not null,
  description text,
  price_aed numeric(10, 2) not null check (price_aed >= 0),
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles (id) on delete cascade,
  label text not null,
  line1 text not null,
  area text not null,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles (id) on delete cascade,
  vendor_id uuid not null references vendors (id) on delete restrict,
  status order_status not null default 'pending',
  payment_method payment_method not null,
  payment_status payment_status not null default 'unpaid',
  subtotal_aed numeric(10, 2) not null,
  commission_amount_aed numeric(10, 2) not null,
  total_aed numeric(10, 2) not null,
  delivery_line1 text not null,
  delivery_area text not null,
  stripe_checkout_session_id text,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  name_snapshot text not null,
  price_snapshot_aed numeric(10, 2) not null,
  quantity integer not null check (quantity > 0)
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors (id) on delete cascade,
  customer_id uuid references profiles (id) on delete set null,
  reviewer_name text,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table coupons (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  code text unique not null,
  discount_percent numeric(5, 2) not null,
  status text not null default 'active' check (status in ('active', 'used')),
  source text not null default 'referral',
  referred_customer_id uuid unique references profiles (id),
  used_at timestamptz,
  used_on_order_id uuid references orders (id),
  created_at timestamptz not null default now()
);

create index idx_vendors_owner on vendors (owner_id);
create index idx_reviews_vendor on reviews (vendor_id);
create index idx_coupons_owner on coupons (owner_id);
create index idx_vendors_status_type on vendors (status, type);
create index idx_products_vendor on products (vendor_id);
create index idx_orders_customer on orders (customer_id);
create index idx_orders_vendor on orders (vendor_id);
create index idx_order_items_order on order_items (order_id);

-- ---------------------------------------------------------------------------
-- New auth.users -> profiles trigger
-- ---------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, preferred_locale)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'customer'),
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'preferred_locale', 'en')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helper: current user's role (avoids recursive RLS lookups on profiles)
-- ---------------------------------------------------------------------------
create function public.current_role()
returns user_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table vendors enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table customer_addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- profiles: users can see/update their own profile; admins see all
create policy "profiles_select_own_or_admin" on profiles
  for select using (id = auth.uid() or public.current_role() = 'admin');

create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());

-- vendors: public can see approved vendors; owners see/manage their own; admins see all
create policy "vendors_select_approved_or_own_or_admin" on vendors
  for select using (
    status = 'approved'
    or owner_id = auth.uid()
    or public.current_role() = 'admin'
  );

create policy "vendors_insert_own" on vendors
  for insert with check (owner_id = auth.uid());

create policy "vendors_update_own_or_admin" on vendors
  for update using (owner_id = auth.uid() or public.current_role() = 'admin');

-- categories: publicly readable, admin-managed
create policy "categories_select_all" on categories
  for select using (true);

create policy "categories_admin_write" on categories
  for all using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- products: public can see available products from approved vendors;
-- vendor owners manage their own; admins manage all
create policy "products_select_public_or_owner_or_admin" on products
  for select using (
    (
      is_available = true
      and exists (
        select 1 from vendors v
        where v.id = products.vendor_id and v.status = 'approved'
      )
    )
    or exists (
      select 1 from vendors v
      where v.id = products.vendor_id and v.owner_id = auth.uid()
    )
    or public.current_role() = 'admin'
  );

create policy "products_write_owner_or_admin" on products
  for all using (
    exists (
      select 1 from vendors v
      where v.id = products.vendor_id and v.owner_id = auth.uid()
    )
    or public.current_role() = 'admin'
  )
  with check (
    exists (
      select 1 from vendors v
      where v.id = products.vendor_id and v.owner_id = auth.uid()
    )
    or public.current_role() = 'admin'
  );

-- customer addresses: owner only
create policy "addresses_owner_only" on customer_addresses
  for all using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

-- orders: customer sees own orders; vendor owner sees orders for their vendor; admin sees all
create policy "orders_select_customer_or_vendor_or_admin" on orders
  for select using (
    customer_id = auth.uid()
    or exists (
      select 1 from vendors v
      where v.id = orders.vendor_id and v.owner_id = auth.uid()
    )
    or public.current_role() = 'admin'
  );

create policy "orders_insert_customer" on orders
  for insert with check (customer_id = auth.uid());

create policy "orders_update_vendor_or_admin" on orders
  for update using (
    exists (
      select 1 from vendors v
      where v.id = orders.vendor_id and v.owner_id = auth.uid()
    )
    or public.current_role() = 'admin'
  );

-- order items: visible/insertable by whoever can see/insert the parent order
create policy "order_items_select_via_order" on order_items
  for select using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and (
          o.customer_id = auth.uid()
          or exists (
            select 1 from vendors v
            where v.id = o.vendor_id and v.owner_id = auth.uid()
          )
          or public.current_role() = 'admin'
        )
    )
  );

create policy "order_items_insert_via_order" on order_items
  for insert with check (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id and o.customer_id = auth.uid()
    )
  );

alter table reviews enable row level security;

create policy "reviews_select_for_approved_vendors" on reviews
  for select using (
    exists (
      select 1 from vendors v
      where v.id = reviews.vendor_id and v.status = 'approved'
    )
  );

create policy "reviews_insert_own" on reviews
  for insert with check (auth.uid() = customer_id);

alter table coupons enable row level security;

create policy "coupons_select_own" on coupons
  for select using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- Seed categories (adjust freely)
-- ---------------------------------------------------------------------------
insert into categories (name, vendor_type) values
  ('Rice & Grains', 'supermarket'),
  ('Spices & Herbs', 'supermarket'),
  ('Bread & Bakery', 'supermarket'),
  ('Dairy', 'supermarket'),
  ('Nuts & Dried Fruits', 'supermarket'),
  ('Frozen Foods', 'supermarket'),
  ('Beverages', 'supermarket'),
  ('Kebab & Grill', 'restaurant'),
  ('Stews (Khoresht)', 'restaurant'),
  ('Appetizers', 'restaurant'),
  ('Desserts', 'restaurant'),
  ('Drinks', 'restaurant'),
  ('Pastries', 'bakery'),
  ('Cakes', 'bakery'),
  ('Cookies & Sweets', 'bakery'),
  ('Fresh Bread', 'bakery'),
  ('Hot Drinks', 'cafe'),
  ('Cold Drinks', 'cafe'),
  ('Pastries & Snacks', 'cafe'),
  ('Cafe Desserts', 'cafe'),
  ('Event Packages', 'catering'),
  ('Platters', 'catering'),
  ('Custom Orders', 'catering');
