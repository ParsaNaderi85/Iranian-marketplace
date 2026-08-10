alter table vendors add column if not exists latitude double precision;
alter table vendors add column if not exists longitude double precision;
alter table orders add column if not exists delivery_lat double precision;
alter table orders add column if not exists delivery_lng double precision;
