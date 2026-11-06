-- Hosted database verification only. Every synthetic movement is rolled back.
-- Requires operator SQL access. Creates no auth accounts or credentials.
-- Never returns actual user identifiers, emails, or financial content.
begin;
do $$ begin perform set_config('pf_test.row', gen_random_uuid()::text, true); end $$;
do $$ begin perform set_config('pf_test.owner', (select id::text from auth.users where email_confirmed_at is not null and not is_anonymous limit 1), true); end $$;
do $$ begin perform set_config('pf_test.other', gen_random_uuid()::text, true); end $$;
do $$ begin perform set_config('request.jwt.claim.sub', current_setting('pf_test.owner'), true); end $$;
do $$ begin perform set_config('request.jwt.claims', jsonb_build_object('sub',current_setting('pf_test.owner'),'role','authenticated','is_anonymous',false)::text, true); end $$;
set local role authenticated;
insert into public.personal_finance_transactions(id,user_id,kind,amount_cents,currency,occurred_on,description,category,payment_method,status,notes)
values(current_setting('pf_test.row')::uuid,current_setting('pf_test.owner')::uuid,'income',12345,'USD','2026-11-05','Synthetic rollback verification','other','other','paid','Automatically rolled back; not a financial record.');
do $$ begin
  if (select count(*) from public.personal_finance_transactions where id=current_setting('pf_test.row')::uuid) <> 1 then raise exception 'Owner read failed'; end if;
  if not exists (select 1 from jsonb_array_elements(public.personal_finance_entries()) entry where entry->>'id'=current_setting('pf_test.row')) then raise exception 'Snapshot owner read failed'; end if;
  update public.personal_finance_transactions set notes='updated' where id=current_setting('pf_test.row')::uuid and version=1;
  if not found then raise exception 'Owner update failed'; end if;
  if (select version from public.personal_finance_transactions where id=current_setting('pf_test.row')::uuid) <> 2 then raise exception 'Version increment failed'; end if;
  update public.personal_finance_transactions set notes='stale' where id=current_setting('pf_test.row')::uuid and version=1;
  if found then raise exception 'Stale version changed row'; end if;
  update public.personal_finance_transactions set archived_at=now() where id=current_setting('pf_test.row')::uuid and version=2;
  update public.personal_finance_transactions set archived_at=null where id=current_setting('pf_test.row')::uuid and version=3;
  if (select version from public.personal_finance_transactions where id=current_setting('pf_test.row')::uuid) <> 4 then raise exception 'Archive restore failed'; end if;
  begin update public.personal_finance_transactions set user_id=current_setting('pf_test.other')::uuid where id=current_setting('pf_test.row')::uuid; raise exception 'Owner reassignment allowed'; exception when insufficient_privilege then null; end;
  begin update public.personal_finance_transactions set id=gen_random_uuid() where id=current_setting('pf_test.row')::uuid; raise exception 'ID reassignment allowed'; exception when insufficient_privilege then null; end;
  begin update public.personal_finance_transactions set version=99 where id=current_setting('pf_test.row')::uuid; raise exception 'Version override allowed'; exception when insufficient_privilege then null; end;
  begin delete from public.personal_finance_transactions where id=current_setting('pf_test.row')::uuid; raise exception 'Delete allowed'; exception when insufficient_privilege then null; end;
end $$;
do $$ begin perform set_config('request.jwt.claim.sub', current_setting('pf_test.other'), true); end $$;
do $$ begin perform set_config('request.jwt.claims', jsonb_build_object('sub',current_setting('pf_test.other'),'role','authenticated','is_anonymous',false,'app_metadata',jsonb_build_object('role','admin'))::text, true); end $$;
do $$ begin
  if exists (select 1 from public.personal_finance_transactions where id=current_setting('pf_test.row')::uuid) then raise exception 'Cross-owner read allowed'; end if;
  if exists (select 1 from jsonb_array_elements(public.personal_finance_entries()) entry where entry->>'id'=current_setting('pf_test.row')) then raise exception 'Cross-owner RPC read allowed'; end if;
  update public.personal_finance_transactions set notes='foreign update' where id=current_setting('pf_test.row')::uuid;
  if found then raise exception 'Cross-owner update allowed'; end if;
  begin
    insert into public.personal_finance_transactions(user_id,kind,amount_cents,currency,occurred_on,description,category,payment_method,status,notes)
    values(current_setting('pf_test.owner')::uuid,'income',1,'USD','2026-11-05','Forged owner','other','other','paid','');
    raise exception 'Cross-owner insert allowed';
  exception when insufficient_privilege then null; end;
end $$;
do $$ begin perform set_config('request.jwt.claim.sub', current_setting('pf_test.owner'), true); end $$;
do $$ begin perform set_config('request.jwt.claims', jsonb_build_object('sub',current_setting('pf_test.owner'),'role','authenticated','is_anonymous',true)::text, true); end $$;
do $$ begin
  if exists (select 1 from public.personal_finance_transactions where id=current_setting('pf_test.row')::uuid) then raise exception 'Anonymous sign-in read allowed'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
  begin perform 1 from public.personal_finance_transactions; raise exception 'Anon table read allowed'; exception when insufficient_privilege then null; end;
  begin perform public.personal_finance_entries(); raise exception 'Anon RPC allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role service_role;
do $$ begin
  begin perform 1 from public.personal_finance_transactions; raise exception 'Service role table read allowed'; exception when insufficient_privilege then null; end;
  begin perform public.personal_finance_entries(); raise exception 'Service role RPC allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select current_setting('pf_test.row') as synthetic_row_id, 'PASS owner, foreign admin, anonymous, service, versions and archive/restore; rolling back' as verification;
rollback;
