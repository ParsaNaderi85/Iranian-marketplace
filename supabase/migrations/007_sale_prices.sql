alter table products add column if not exists sale_price_aed numeric(10, 2) check (sale_price_aed >= 0);
