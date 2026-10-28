begin;
alter table public.investment_vehicles alter column purchase_cents drop not null;
alter table public.investment_vehicles alter column purchased_on drop not null;
alter table public.investment_vehicles add column catalogue_slug text unique check(catalogue_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(catalogue_slug)<=160);
-- Keep the existing vehicle membership RLS unchanged. Ordinary authenticated
-- requests can read only non-cost columns on vehicles they are allowed to see.
-- Authenticated admin server pages use the service client only after checking
-- the authoritative profiles.role. Writes still use authenticated RLS.
revoke select on public.investment_vehicles from authenticated;
grant select(id,title,vin,status,asking_cents,sale_cents,purchased_on,version,created_at,catalogue_slug) on public.investment_vehicles to authenticated;
-- Repairs and expense amounts are cost records; admins alone may read them.
alter policy investment_expenses_read on public.investment_expenses using (investment_private.is_admin());
commit;
