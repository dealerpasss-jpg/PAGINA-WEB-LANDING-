-- Separate personal records; never imports or changes vehicle finances.
create table public.personal_finance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('income', 'expense')),
  amount_cents bigint not null check (amount_cents between 1 and 99999999999),
  currency text not null check (currency in ('USD', 'COP')),
  occurred_on date not null check (occurred_on between date '1900-01-01' and date '2100-12-31'),
  description text not null check (length(btrim(description)) between 1 and 160),
  category text not null check (category in ('personal','vehicle_sale','salary','home','food','transport','services','debt','health','other')),
  payment_method text not null check (payment_method in ('cash','transfer','card','other')),
  status text not null check (status in ('paid','pending')),
  notes text not null default '' check (length(notes) <= 2000),
  version integer not null default 1 check (version > 0),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index personal_finance_owner_date_idx on public.personal_finance_transactions (user_id, occurred_on desc, id);
alter table public.personal_finance_transactions enable row level security;
alter table public.personal_finance_transactions force row level security;

-- No anonymous, team/admin or service-role access path is used by this feature.
revoke all on public.personal_finance_transactions from public, anon, authenticated, service_role;
grant select on public.personal_finance_transactions to authenticated;
grant insert (id,user_id,kind,amount_cents,currency,occurred_on,description,category,payment_method,status,notes) on public.personal_finance_transactions to authenticated;
grant update (kind,amount_cents,currency,occurred_on,description,category,payment_method,status,notes,archived_at) on public.personal_finance_transactions to authenticated;

create policy personal_finance_select_own on public.personal_finance_transactions for select to authenticated
  using ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false));
create policy personal_finance_insert_own on public.personal_finance_transactions for insert to authenticated
  with check ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false));
create policy personal_finance_update_own on public.personal_finance_transactions for update to authenticated
  using ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false))
  with check ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false));

create function public.personal_finance_touch() returns trigger
language plpgsql security invoker set search_path = pg_catalog as $$
begin
  if new.id is distinct from old.id or new.user_id is distinct from old.user_id then
    raise exception 'Movement ownership cannot change';
  end if;
  new.version := old.version + 1;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.personal_finance_touch() from public, anon, authenticated, service_role;
create trigger personal_finance_version before update on public.personal_finance_transactions
  for each row execute function public.personal_finance_touch();

-- A single-statement snapshot avoids OFFSET races and PostgREST row-limit truncation.
create function public.personal_finance_entries() returns jsonb
language sql stable security invoker set search_path = pg_catalog as $$
  select coalesce(jsonb_agg(to_jsonb(entry) order by entry.occurred_on desc, entry.id), '[]'::jsonb)
  from (
    select id,kind,amount_cents,currency,occurred_on,description,category,
      payment_method,status,notes,version,archived_at
    from public.personal_finance_transactions
    where user_id = (select auth.uid())
  ) entry;
$$;
revoke all on function public.personal_finance_entries() from public, anon, authenticated, service_role;
grant execute on function public.personal_finance_entries() to authenticated;
