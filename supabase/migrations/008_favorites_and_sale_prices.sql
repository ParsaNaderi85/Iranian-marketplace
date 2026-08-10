-- Run this whole file as one execution in the SQL editor.

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
