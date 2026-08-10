-- Run this whole file as one execution in the SQL editor.

alter table profiles add column if not exists referral_code text unique;
alter table profiles add column if not exists referred_by uuid references profiles (id);

create table if not exists coupons (
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

alter table coupons enable row level security;

create policy "Customers can view their own coupons"
  on coupons for select
  using (auth.uid() = owner_id);

-- Note: profiles already has an "update own profile" policy from the base
-- schema, which covers customers setting their own referred_by.
