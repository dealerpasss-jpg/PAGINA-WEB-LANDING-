-- Private investment principal ledger. Separate from income, expenses and vehicle accounts.
create table public.personal_investment_funds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  person_name text not null check (length(btrim(person_name)) >= 1 and length(person_name) <= 120),
  description text not null check (length(btrim(description)) >= 1 and length(description) <= 160),
  principal_cents bigint not null check (principal_cents between 1 and 99999999999),
  currency text not null check (currency in ('USD','COP')),
  received_on date not null check (received_on between date '1900-01-01' and date '2100-12-31'),
  notes text not null default '' check (length(notes) <= 2000),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id,user_id)
);
create table public.personal_investment_repayments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  fund_id uuid not null,
  amount_cents bigint not null check (amount_cents between 1 and 99999999999),
  paid_on date not null check (paid_on between date '1900-01-01' and date '2100-12-31'),
  payment_method text not null check (payment_method in ('cash','transfer','card','other')),
  notes text not null default '' check (length(notes) <= 2000),
  voided_at timestamptz,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (fund_id,user_id) references public.personal_investment_funds(id,user_id)
);
create index personal_investment_funds_owner_date_idx on public.personal_investment_funds(user_id,received_on desc,id);
create index personal_investment_repayments_fund_idx on public.personal_investment_repayments(fund_id,user_id,paid_on,id);
alter table public.personal_investment_funds enable row level security;
alter table public.personal_investment_funds force row level security;
alter table public.personal_investment_repayments enable row level security;
alter table public.personal_investment_repayments force row level security;
revoke all on public.personal_investment_funds, public.personal_investment_repayments from public,anon,authenticated,service_role;
grant select on public.personal_investment_funds, public.personal_investment_repayments to authenticated;
grant insert (id,user_id,person_name,description,principal_cents,currency,received_on,notes) on public.personal_investment_funds to authenticated;
grant update (person_name,description,principal_cents,received_on,notes) on public.personal_investment_funds to authenticated;
grant insert (id,user_id,fund_id,amount_cents,paid_on,payment_method,notes) on public.personal_investment_repayments to authenticated;
-- Correct a payment by voiding it and adding a new one; never rewrite its history.
grant update (voided_at) on public.personal_investment_repayments to authenticated;
create policy personal_investment_funds_select_own on public.personal_investment_funds for select to authenticated
  using ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean,false));
create policy personal_investment_funds_insert_own on public.personal_investment_funds for insert to authenticated
  with check ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean,false));
create policy personal_investment_funds_update_own on public.personal_investment_funds for update to authenticated
  using ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean,false))
  with check ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean,false));
create policy personal_investment_repayments_select_own on public.personal_investment_repayments for select to authenticated
  using ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean,false));
create policy personal_investment_repayments_insert_own on public.personal_investment_repayments for insert to authenticated
  with check ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean,false));
create policy personal_investment_repayments_update_own on public.personal_investment_repayments for update to authenticated
  using ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean,false))
  with check ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean,false));

create function public.personal_investment_fund_guard() returns trigger
language plpgsql volatile security invoker set search_path = pg_catalog as $$
begin
  if new.id is distinct from old.id or new.user_id is distinct from old.user_id or new.currency is distinct from old.currency then
    raise exception 'Investment identity, owner and currency cannot change' using errcode = '23514';
  end if;
  if new.principal_cents < (select coalesce(sum(amount_cents),0) from public.personal_investment_repayments
      where fund_id=old.id and user_id=old.user_id and voided_at is null) then
    raise exception 'Principal cannot be less than active repayments' using errcode = '23514';
  end if;
  if exists (select 1 from public.personal_investment_repayments where fund_id=old.id and user_id=old.user_id and paid_on < new.received_on) then
    raise exception 'Received date cannot follow any historical repayment' using errcode = '23514';
  end if;
  new.version := old.version + 1;
  new.created_at := old.created_at;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function public.personal_investment_fund_guard() from public,anon,authenticated,service_role;
create trigger personal_investment_fund_guard before update on public.personal_investment_funds
  for each row execute function public.personal_investment_fund_guard();

create function public.personal_investment_repayment_guard() returns trigger
language plpgsql volatile security invoker set search_path = pg_catalog as $$
declare
  principal bigint;
  received date;
  active_total numeric;
begin
  if tg_op='UPDATE' then
    if new.id is distinct from old.id or new.user_id is distinct from old.user_id or new.fund_id is distinct from old.fund_id
      or new.amount_cents is distinct from old.amount_cents or new.paid_on is distinct from old.paid_on
      or new.payment_method is distinct from old.payment_method or new.notes is distinct from old.notes then
      raise exception 'Repayment history cannot change; void and create a correction' using errcode='23514';
    end if;
    new.version := old.version + 1;
    new.created_at := old.created_at;
    new.updated_at := clock_timestamp();
    -- Record the actual time of a new void, not a client-supplied timestamp.
    if new.voided_at is not null then
      new.voided_at := coalesce(old.voided_at,clock_timestamp());
    end if;
  end if;
  -- UPDATE, rather than just FOR UPDATE, serializes writers and creates a new
  -- parent tuple. READ COMMITTED gets fresh snapshots in the following VOLATILE
  -- statements; REPEATABLE READ/SERIALIZABLE concurrent writers fail with 40001
  -- instead of validating against an obsolete aggregate. Never catch that error.
  -- Also invalidates a stale fund edit after a repayment changes its balance.
  update public.personal_investment_funds set principal_cents=principal_cents
    where id=new.fund_id and user_id=new.user_id
    returning principal_cents,received_on into principal,received;
  if not found then
    raise exception 'Investment fund not found or not owned' using errcode='23503';
  end if;
  if new.paid_on < received then
    raise exception 'Repayment cannot predate receipt' using errcode='23514';
  end if;
  select coalesce(sum(amount_cents),0) into active_total from public.personal_investment_repayments
    where fund_id=new.fund_id and user_id=new.user_id and voided_at is null
      and (tg_op='INSERT' or id <> old.id);
  if new.voided_at is null and active_total + new.amount_cents > principal then
    raise exception 'Repayment exceeds outstanding principal' using errcode='23514';
  end if;
  return new;
end;
$$;
revoke all on function public.personal_investment_repayment_guard() from public,anon,authenticated,service_role;
create trigger personal_investment_repayment_guard before insert or update on public.personal_investment_repayments
  for each row execute function public.personal_investment_repayment_guard();

-- One SQL statement and one JSON result: coherent snapshot, no row-limit truncation.
create function public.personal_investment_snapshot() returns jsonb
language sql stable security invoker set search_path = pg_catalog as $$
  select jsonb_build_object(
    'funds',(select coalesce(jsonb_agg(to_jsonb(f) order by f.received_on desc,f.id),'[]'::jsonb) from (
      select id,person_name,description,principal_cents,currency,received_on,notes,version,created_at,updated_at
      from public.personal_investment_funds where user_id=(select auth.uid())
    ) f),
    'repayments',(select coalesce(jsonb_agg(to_jsonb(r) order by r.paid_on desc,r.id),'[]'::jsonb) from (
      select id,fund_id,amount_cents,paid_on,payment_method,notes,voided_at,version,created_at,updated_at
      from public.personal_investment_repayments where user_id=(select auth.uid())
    ) r)
  );
$$;
revoke all on function public.personal_investment_snapshot() from public,anon,authenticated,service_role;
grant execute on function public.personal_investment_snapshot() to authenticated;
