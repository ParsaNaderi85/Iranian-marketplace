-- Run this whole file as one execution in the SQL editor.
-- (Combines the still-pending favorites/sale-price migration with the new
-- external sales table, so it's one step instead of several.)

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
  using (
    exists (
      select 1 from vendors
      where vendors.id = external_sales.vendor_id and vendors.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from vendors
      where vendors.id = external_sales.vendor_id and vendors.owner_id = auth.uid()
    )
  );
