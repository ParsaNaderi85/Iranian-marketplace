-- Everything currently pending, combined into one run. Paste this whole file
-- into the SQL editor and click Run once.

-- Sale prices, favorites, external sales, geo coordinates ------------------
alter table products add column if not exists sale_price_aed numeric(10, 2) check (sale_price_aed >= 0);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles (id) on delete cascade,
  vendor_id uuid not null references vendors (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, vendor_id)
);
alter table favorites enable row level security;
create policy "Customers manage their own favorites"
  on favorites for all
  using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);

create table if not exists external_sales (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors (id) on delete cascade,
  amount_aed numeric(10, 2) not null check (amount_aed >= 0),
  description text,
  channel text not null default 'other' check (channel in ('whatsapp', 'instagram', 'walk_in', 'other')),
  sale_date date not null default current_date,
  created_at timestamptz not null default now()
);
alter table external_sales enable row level security;
create policy "Vendors manage their own external sales"
  on external_sales for all
  using (exists (select 1 from vendors where vendors.id = external_sales.vendor_id and vendors.owner_id = auth.uid()))
  with check (exists (select 1 from vendors where vendors.id = external_sales.vendor_id and vendors.owner_id = auth.uid()));

alter table vendors add column if not exists latitude double precision;
alter table vendors add column if not exists longitude double precision;
alter table orders add column if not exists delivery_lat double precision;
alter table orders add column if not exists delivery_lng double precision;

-- Cost/margin, inventory, banners --------------------------------------
alter table products add column if not exists cost_price_aed numeric(10, 2) check (cost_price_aed >= 0);
alter table products add column if not exists stock_quantity integer;
alter table products add column if not exists low_stock_threshold integer not null default 5;
alter table vendors add column if not exists banner_url text;

-- Best sellers & vendor-owned custom categories ----------------------------
alter table products add column if not exists is_best_seller boolean not null default false;
alter table categories add column if not exists vendor_id uuid references vendors (id) on delete cascade;
create policy "categories_vendor_insert" on categories
  for insert with check (
    vendor_id is not null
    and exists (select 1 from vendors where vendors.id = categories.vendor_id and vendors.owner_id = auth.uid())
  );
create policy "categories_vendor_delete" on categories
  for delete using (
    vendor_id is not null
    and exists (select 1 from vendors where vendors.id = categories.vendor_id and vendors.owner_id = auth.uid())
  );

-- Vendor-issued discount codes ------------------------------------------
create table if not exists vendor_coupons (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors (id) on delete cascade,
  code text not null,
  discount_percent numeric(5, 2) not null check (discount_percent > 0 and discount_percent <= 100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (vendor_id, code)
);
alter table vendor_coupons enable row level security;
create policy "Vendors manage their own coupons"
  on vendor_coupons for all
  using (exists (select 1 from vendors where vendors.id = vendor_coupons.vendor_id and vendors.owner_id = auth.uid()))
  with check (exists (select 1 from vendors where vendors.id = vendor_coupons.vendor_id and vendors.owner_id = auth.uid()));
create policy "Anyone can read active coupons to validate at checkout"
  on vendor_coupons for select
  using (active = true);

-- Vendor staff accounts ---------------------------------------------------
create table if not exists vendor_staff (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  can_view_financials boolean not null default false,
  created_at timestamptz not null default now(),
  unique (vendor_id, user_id)
);
alter table vendor_staff enable row level security;
create policy "Owners manage their own staff list"
  on vendor_staff for all
  using (exists (select 1 from vendors where vendors.id = vendor_staff.vendor_id and vendors.owner_id = auth.uid()))
  with check (exists (select 1 from vendors where vendors.id = vendor_staff.vendor_id and vendors.owner_id = auth.uid()));
create policy "Staff can see their own membership rows"
  on vendor_staff for select
  using (auth.uid() = user_id);

-- "Become a vendor" business submissions ----------------------------------
create table if not exists vendor_applications (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  business_type text not null check (business_type in ('supermarket', 'restaurant', 'bakery', 'cafe', 'catering')),
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  area text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
alter table vendor_applications enable row level security;
create policy "Anyone can submit a vendor application"
  on vendor_applications for insert
  with check (true);
create policy "Admins manage vendor applications"
  on vendor_applications for all
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'))
  with check (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));
