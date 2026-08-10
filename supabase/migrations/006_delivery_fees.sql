alter table vendors add column if not exists delivery_fee_aed numeric(10, 2) not null default 0;
alter table orders add column if not exists delivery_fee_aed numeric(10, 2) not null default 0;
