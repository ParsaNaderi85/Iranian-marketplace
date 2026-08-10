-- Run this whole file as one execution in the SQL editor.

alter table vendors add column if not exists translations jsonb;

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors (id) on delete cascade,
  customer_id uuid references profiles (id) on delete set null,
  reviewer_name text,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

alter table reviews enable row level security;

create policy "Anyone can read reviews for approved vendors"
  on reviews for select
  using (
    exists (
      select 1 from vendors
      where vendors.id = reviews.vendor_id
      and vendors.status = 'approved'
    )
  );

create policy "Customers can insert their own reviews"
  on reviews for insert
  with check (auth.uid() = customer_id);
