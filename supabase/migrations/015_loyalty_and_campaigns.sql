-- Loyalty points balance -------------------------------------------------
alter table profiles add column if not exists loyalty_points integer not null default 0;

-- Seasonal / cultural campaigns -------------------------------------------
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  discount_percent numeric(5, 2) check (discount_percent is null or (discount_percent > 0 and discount_percent <= 100)),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table campaigns enable row level security;
create policy "Anyone can read campaigns"
  on campaigns for select
  using (true);
create policy "Admins manage campaigns"
  on campaigns for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');
