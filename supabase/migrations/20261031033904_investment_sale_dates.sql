begin;
set local lock_timeout = '3s';
set local statement_timeout = '15s';
-- Additive only: no default, backfill, row update, privilege or RLS change.
-- Existing undated closes remain undated until an administrator confirms them.
alter table public.investment_vehicles add column sold_on date;
alter table public.investment_vehicles
  add constraint investment_vehicle_sale_date_status check (sold_on is null or status = 'sold'),
  add constraint investment_vehicle_sale_date_order check (sold_on is null or purchased_on is null or sold_on >= purchased_on),
  add constraint investment_vehicle_sale_date_range check (sold_on is null or sold_on between date '0001-01-01' and date '9999-12-31');
-- New columns inherit no SELECT grant from the existing column allowlist.
-- Verified admin server reads use the existing service client; writes retain RLS.
commit;
