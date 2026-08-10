-- Atomically checks-and-decrements stock for every line item in one order.
-- Runs as a single statement per item inside one implicit transaction, so if
-- any item is short on stock the whole call raises and every decrement made
-- earlier in the same call is rolled back — no read-then-write race between
-- concurrent checkouts.
create or replace function public.decrement_stock_for_order(items jsonb)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  item jsonb;
  updated_rows integer;
begin
  for item in select * from jsonb_array_elements(items)
  loop
    update products
    set stock_quantity = stock_quantity - (item->>'quantity')::integer
    where id = (item->>'product_id')::uuid
      and (stock_quantity is null or stock_quantity >= (item->>'quantity')::integer);

    get diagnostics updated_rows = row_count;
    if updated_rows = 0 then
      raise exception 'insufficient_stock' using errcode = 'P0001';
    end if;
  end loop;
end;
$$;
