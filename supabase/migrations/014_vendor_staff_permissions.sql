-- Lets vendor_staff members operate their vendor's products and orders,
-- the same way the vendor owner can. Run this after 013.

create or replace function public.is_vendor_staff(target_vendor_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from vendor_staff
    where vendor_staff.vendor_id = target_vendor_id
    and vendor_staff.user_id = auth.uid()
  );
$$;

drop policy if exists "products_select_public_or_owner_or_admin" on products;
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
    or public.is_vendor_staff(products.vendor_id)
    or public.current_role() = 'admin'
  );

drop policy if exists "products_write_owner_or_admin" on products;
create policy "products_write_owner_or_admin" on products
  for all using (
    exists (
      select 1 from vendors v
      where v.id = products.vendor_id and v.owner_id = auth.uid()
    )
    or public.is_vendor_staff(products.vendor_id)
    or public.current_role() = 'admin'
  )
  with check (
    exists (
      select 1 from vendors v
      where v.id = products.vendor_id and v.owner_id = auth.uid()
    )
    or public.is_vendor_staff(products.vendor_id)
    or public.current_role() = 'admin'
  );

drop policy if exists "orders_select_customer_or_vendor_or_admin" on orders;
create policy "orders_select_customer_or_vendor_or_admin" on orders
  for select using (
    customer_id = auth.uid()
    or exists (
      select 1 from vendors v
      where v.id = orders.vendor_id and v.owner_id = auth.uid()
    )
    or public.is_vendor_staff(orders.vendor_id)
    or public.current_role() = 'admin'
  );

drop policy if exists "orders_update_vendor_or_admin" on orders;
create policy "orders_update_vendor_or_admin" on orders
  for update using (
    exists (
      select 1 from vendors v
      where v.id = orders.vendor_id and v.owner_id = auth.uid()
    )
    or public.is_vendor_staff(orders.vendor_id)
    or public.current_role() = 'admin'
  );

drop policy if exists "categories_vendor_insert" on categories;
create policy "categories_vendor_insert" on categories
  for insert with check (
    vendor_id is not null
    and (
      exists (select 1 from vendors where vendors.id = categories.vendor_id and vendors.owner_id = auth.uid())
      or public.is_vendor_staff(categories.vendor_id)
    )
  );

drop policy if exists "categories_vendor_delete" on categories;
create policy "categories_vendor_delete" on categories
  for delete using (
    vendor_id is not null
    and (
      exists (select 1 from vendors where vendors.id = categories.vendor_id and vendors.owner_id = auth.uid())
      or public.is_vendor_staff(categories.vendor_id)
    )
  );
