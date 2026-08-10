-- Manual vendor payout tracking -------------------------------------------
alter table orders add column if not exists paid_out boolean not null default false;

create table if not exists vendor_payouts (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors (id) on delete cascade,
  amount_aed numeric(10, 2) not null check (amount_aed >= 0),
  order_count integer not null default 0,
  note text,
  created_at timestamptz not null default now()
);
alter table vendor_payouts enable row level security;
create policy "Vendors can read their own payout history"
  on vendor_payouts for select
  using (exists (select 1 from vendors where vendors.id = vendor_payouts.vendor_id and vendors.owner_id = auth.uid()));
create policy "Admins manage payouts"
  on vendor_payouts for all
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'))
  with check (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Group ordering (organizer shares a link, contributors add their own items,
-- organizer checks out for everyone) -------------------------------------
create table if not exists group_orders (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references profiles (id) on delete cascade,
  vendor_id uuid not null references vendors (id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'checked_out', 'cancelled')),
  order_id uuid references orders (id),
  created_at timestamptz not null default now()
);
alter table group_orders enable row level security;
create policy "Anyone with the link can view a group order"
  on group_orders for select
  using (true);
create policy "Organizer manages their group order"
  on group_orders for all
  using (organizer_id = auth.uid())
  with check (organizer_id = auth.uid());

create table if not exists group_order_items (
  id uuid primary key default gen_random_uuid(),
  group_order_id uuid not null references group_orders (id) on delete cascade,
  contributor_id uuid not null references profiles (id) on delete cascade,
  contributor_name text not null,
  product_id uuid not null references products (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);
alter table group_order_items enable row level security;
create policy "Anyone with the link can view group order items"
  on group_order_items for select
  using (true);
create policy "Contributors add their own items"
  on group_order_items for insert
  with check (contributor_id = auth.uid());
create policy "Contributors remove their own items, organizer removes any"
  on group_order_items for delete
  using (
    contributor_id = auth.uid()
    or exists (
      select 1 from group_orders
      where group_orders.id = group_order_items.group_order_id
      and group_orders.organizer_id = auth.uid()
    )
  );
