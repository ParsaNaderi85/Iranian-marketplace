alter table products add column if not exists is_best_seller boolean not null default false;
alter table categories add column if not exists vendor_id uuid references vendors (id) on delete cascade;

-- Vendors can additionally create/manage their own custom categories
-- (existing "categories_select_all" policy already lets everyone read them).
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
