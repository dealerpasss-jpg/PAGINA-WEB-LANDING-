begin;
create schema if not exists investment_private;
revoke all on schema investment_private from public;
grant usage on schema investment_private to authenticated, service_role;
-- Profiles are intentionally inaccessible via the Data API. This narrow lookup
-- checks the authenticated UUID against the authoritative role, never metadata.
create function investment_private.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;
revoke all on function investment_private.is_admin() from public,anon;
grant execute on function investment_private.is_admin() to authenticated,service_role;
create table public.investment_vehicles (
 id uuid primary key default gen_random_uuid(), title text not null check(length(title) between 1 and 120),
 vin text not null default '' check(vin='' or vin ~ '^[A-HJ-NPR-Z0-9]{17}$'), auction text not null default '' check(length(auction)<=100),
 purchased_on date not null, purchase_cents bigint not null check(purchase_cents between 0 and 99999999999),
 asking_cents bigint check(asking_cents between 0 and 99999999999), sale_cents bigint check(sale_cents between 0 and 99999999999),
 status text not null default 'purchased' check(status in ('purchased','repairing','listed','sold')),
 notes text not null default '' check(length(notes)<=2000), version integer not null default 1,
 created_at timestamptz not null default now(), check((status='sold')=(sale_cents is not null))
);
create table public.investment_members (
 id uuid primary key default gen_random_uuid(), vehicle_id uuid not null references public.investment_vehicles(id),
 user_id uuid references auth.users(id), email text not null check(email=lower(email) and length(email)<=254),
 name text not null check(length(name) between 1 and 100), contribution_cents bigint not null default 0 check(contribution_cents between 0 and 99999999999),
 returned_cents bigint not null default 0 check(returned_cents between 0 and 99999999999), revoked_at timestamptz,
 created_at timestamptz not null default now(), unique(vehicle_id,email)
);
create index investment_members_user_vehicle on public.investment_members(user_id,vehicle_id) where revoked_at is null;
create index investment_members_pending_email on public.investment_members(email) where user_id is null and revoked_at is null;
create table public.investment_expenses (
 id uuid primary key default gen_random_uuid(), vehicle_id uuid not null references public.investment_vehicles(id),
 category text not null check(category in ('auction','repair','transport','title','other')),
 description text not null check(length(description) between 1 and 500), amount_cents bigint not null check(amount_cents between 0 and 99999999999),
 incurred_on date not null, voided_at timestamptz, created_at timestamptz not null default now()
);
create index investment_expenses_vehicle on public.investment_expenses(vehicle_id);
create table public.investment_photos (
 id uuid primary key default gen_random_uuid(), vehicle_id uuid not null references public.investment_vehicles(id),
 path text not null unique check(path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.jpg$'), created_at timestamptz not null default now(),
 check(split_part(path,'/',1)=vehicle_id::text)
);
create index investment_photos_vehicle on public.investment_photos(vehicle_id);
create table public.investment_audit (
 id bigint generated always as identity primary key, actor uuid, entity text not null, operation text not null,
 before_data jsonb, after_data jsonb, created_at timestamptz not null default now()
);
alter table public.investment_vehicles enable row level security;
alter table public.investment_members enable row level security;
alter table public.investment_expenses enable row level security;
alter table public.investment_photos enable row level security;
alter table public.investment_audit enable row level security;
revoke all on public.investment_vehicles,public.investment_members,public.investment_expenses,public.investment_photos,public.investment_audit from anon,authenticated;
grant select,insert,update on public.investment_vehicles,public.investment_members,public.investment_expenses,public.investment_photos to authenticated;
grant select,insert on public.investment_audit to authenticated;
grant usage on sequence public.investment_audit_id_seq to authenticated;
grant all on public.investment_vehicles,public.investment_members,public.investment_expenses,public.investment_photos,public.investment_audit to service_role;
grant usage on sequence public.investment_audit_id_seq to service_role;
create policy investment_members_read on public.investment_members for select to authenticated using (investment_private.is_admin() or (user_id=(select auth.uid()) and revoked_at is null));
create policy investment_members_insert on public.investment_members for insert to authenticated with check(investment_private.is_admin());
create policy investment_members_update on public.investment_members for update to authenticated using(investment_private.is_admin()) with check(investment_private.is_admin());
create policy investment_vehicles_read on public.investment_vehicles for select to authenticated using(investment_private.is_admin() or exists(select 1 from public.investment_members m where m.vehicle_id=investment_vehicles.id and m.user_id=(select auth.uid()) and m.revoked_at is null));
create policy investment_vehicles_insert on public.investment_vehicles for insert to authenticated with check(investment_private.is_admin());
create policy investment_vehicles_update on public.investment_vehicles for update to authenticated using(investment_private.is_admin()) with check(investment_private.is_admin());
create policy investment_expenses_read on public.investment_expenses for select to authenticated using(investment_private.is_admin() or exists(select 1 from public.investment_members m where m.vehicle_id=investment_expenses.vehicle_id and m.user_id=(select auth.uid()) and m.revoked_at is null));
create policy investment_expenses_insert on public.investment_expenses for insert to authenticated with check(investment_private.is_admin());
create policy investment_expenses_update on public.investment_expenses for update to authenticated using(investment_private.is_admin()) with check(investment_private.is_admin());
create policy investment_photos_read on public.investment_photos for select to authenticated using(investment_private.is_admin() or exists(select 1 from public.investment_members m where m.vehicle_id=investment_photos.vehicle_id and m.user_id=(select auth.uid()) and m.revoked_at is null));
create policy investment_photos_insert on public.investment_photos for insert to authenticated with check(investment_private.is_admin());
create policy investment_photos_update on public.investment_photos for update to authenticated using(investment_private.is_admin()) with check(investment_private.is_admin());
create policy investment_audit_read on public.investment_audit for select to authenticated using(investment_private.is_admin());
create policy investment_audit_insert on public.investment_audit for insert to authenticated with check(investment_private.is_admin());
create function investment_private.audit_change() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 insert into public.investment_audit(actor,entity,operation,before_data,after_data) values(auth.uid(),tg_table_name,tg_op,case when tg_op='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
 return new;
end;
$$;
revoke all on function investment_private.audit_change() from public,anon;
grant execute on function investment_private.audit_change() to authenticated,service_role;
create trigger investment_vehicle_audit after insert or update on public.investment_vehicles for each row execute function investment_private.audit_change();
create trigger investment_expense_audit after insert or update on public.investment_expenses for each row execute function investment_private.audit_change();
create trigger investment_member_audit after insert or update on public.investment_members for each row execute function investment_private.audit_change();
create trigger investment_photo_audit after insert or update on public.investment_photos for each row execute function investment_private.audit_change();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('investment-photos','investment-photos',false,3145728,array['image/jpeg']);
create policy investment_storage_insert on storage.objects for insert to authenticated with check(bucket_id='investment-photos' and investment_private.is_admin() and exists(select 1 from public.investment_vehicles v where v.id::text=split_part(name,'/',1)));
-- Both direct authenticated storage reads and the server route require current membership.
create policy investment_storage_read on storage.objects for select to authenticated using (
 bucket_id='investment-photos' and (
 investment_private.is_admin() or exists(select 1 from public.investment_members m
 where m.vehicle_id::text=split_part(storage.objects.name,'/',1) and m.user_id=(select auth.uid()) and m.revoked_at is null)
 ));
commit;
