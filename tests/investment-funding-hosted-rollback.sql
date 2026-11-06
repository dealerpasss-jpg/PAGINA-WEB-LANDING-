-- Synthetic verification only. Entire transaction rolls back; no Auth users created.
begin;
do $$ begin
  perform set_config('ift.owner',(select id::text from auth.users where email_confirmed_at is not null and not is_anonymous limit 1),true);
  perform set_config('ift.other',gen_random_uuid()::text,true);
  perform set_config('ift.fund',gen_random_uuid()::text,true);
  perform set_config('ift.payment',gen_random_uuid()::text,true);
  perform set_config('ift.final',gen_random_uuid()::text,true);
  perform set_config('ift.replacement',gen_random_uuid()::text,true);
  perform set_config('request.jwt.claim.sub',current_setting('ift.owner'),true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('ift.owner'),'role','authenticated','is_anonymous',false)::text,true);
end $$;
set local role authenticated;
insert into public.personal_investment_funds(id,user_id,person_name,description,principal_cents,currency,received_on,notes)
values(current_setting('ift.fund')::uuid,current_setting('ift.owner')::uuid,'Synthetic rollback person','Test capital, never persisted',100000,'USD','2026-11-01','Automatically rolled back');
insert into public.personal_investment_repayments(id,user_id,fund_id,amount_cents,paid_on,payment_method,notes)
values(current_setting('ift.payment')::uuid,current_setting('ift.owner')::uuid,current_setting('ift.fund')::uuid,25000,'2026-11-06','transfer','Synthetic rollback payment');
do $$ declare v integer; begin
  if (select count(*) from public.personal_investment_funds where id=current_setting('ift.fund')::uuid)<>1 then raise exception 'Owner fund read failed'; end if;
  if not exists(select 1 from jsonb_array_elements(public.personal_investment_snapshot()->'repayments') r where r->>'id'=current_setting('ift.payment')) then raise exception 'Owner snapshot failed'; end if;
  select version into v from public.personal_investment_funds where id=current_setting('ift.fund')::uuid;
  if v<>2 then raise exception 'Repayment did not increment fund version'; end if;
  begin update public.personal_investment_funds set principal_cents=20000 where id=current_setting('ift.fund')::uuid; raise exception 'Principal reduction allowed'; exception when check_violation then null; end;
  begin update public.personal_investment_funds set received_on='2026-11-07' where id=current_setting('ift.fund')::uuid; raise exception 'Date advancement allowed'; exception when check_violation then null; end;
  begin update public.personal_investment_funds set currency='COP' where id=current_setting('ift.fund')::uuid; raise exception 'Currency mutation allowed'; exception when insufficient_privilege then null; end;
  begin update public.personal_investment_repayments set amount_cents=1 where id=current_setting('ift.payment')::uuid; raise exception 'Payment history rewrite allowed'; exception when insufficient_privilege then null; end;
  begin insert into public.personal_investment_repayments(user_id,fund_id,amount_cents,paid_on,payment_method) values(current_setting('ift.owner')::uuid,current_setting('ift.fund')::uuid,80000,'2026-11-06','cash'); raise exception 'Overpayment allowed'; exception when check_violation then null; end;
  update public.personal_investment_funds set notes='stale' where id=current_setting('ift.fund')::uuid and version=1;
  if found then raise exception 'Stale fund update allowed'; end if;
end $$;
insert into public.personal_investment_repayments(id,user_id,fund_id,amount_cents,paid_on,payment_method)
values(current_setting('ift.final')::uuid,current_setting('ift.owner')::uuid,current_setting('ift.fund')::uuid,75000,'2026-11-06','cash');
do $$ begin
  if (select sum(amount_cents) from public.personal_investment_repayments where fund_id=current_setting('ift.fund')::uuid and voided_at is null)<>100000 then raise exception 'Settlement total wrong'; end if;
  begin insert into public.personal_investment_repayments(id,user_id,fund_id,amount_cents,paid_on,payment_method) values(current_setting('ift.final')::uuid,current_setting('ift.owner')::uuid,current_setting('ift.fund')::uuid,75000,'2026-11-06','cash'); raise exception 'Duplicate accepted'; exception when unique_violation or check_violation then null; end;
end $$;
update public.personal_investment_repayments set voided_at=now() where id=current_setting('ift.final')::uuid and version=1;
insert into public.personal_investment_repayments(id,user_id,fund_id,amount_cents,paid_on,payment_method)
values(current_setting('ift.replacement')::uuid,current_setting('ift.owner')::uuid,current_setting('ift.fund')::uuid,75000,'2026-11-06','cash');
do $$ begin
  begin update public.personal_investment_repayments set voided_at=null where id=current_setting('ift.final')::uuid; raise exception 'Overpaying restore allowed'; exception when check_violation then null; end;
end $$;
update public.personal_investment_repayments set voided_at=now() where id=current_setting('ift.replacement')::uuid;
update public.personal_investment_repayments set voided_at=null where id=current_setting('ift.final')::uuid;
do $$ begin
  if (select sum(amount_cents) from public.personal_investment_repayments where fund_id=current_setting('ift.fund')::uuid and voided_at is null)<>100000 then raise exception 'Restore total wrong'; end if;
  begin delete from public.personal_investment_repayments where fund_id=current_setting('ift.fund')::uuid; raise exception 'Delete allowed'; exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claim.sub',current_setting('ift.other'),true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('ift.other'),'role','authenticated','is_anonymous',false,'app_metadata',jsonb_build_object('role','admin'))::text,true);
end $$;
do $$ begin
  if exists(select 1 from public.personal_investment_funds where id=current_setting('ift.fund')::uuid) then raise exception 'Foreign fund read allowed'; end if;
  if exists(select 1 from public.personal_investment_repayments where fund_id=current_setting('ift.fund')::uuid) then raise exception 'Foreign payment read allowed'; end if;
  if exists(select 1 from jsonb_array_elements(public.personal_investment_snapshot()->'funds') f where f->>'id'=current_setting('ift.fund')) then raise exception 'Foreign snapshot read allowed'; end if;
  update public.personal_investment_funds set principal_cents=1 where id=current_setting('ift.fund')::uuid;
  if found then raise exception 'Foreign update allowed'; end if;
  begin insert into public.personal_investment_repayments(user_id,fund_id,amount_cents,paid_on,payment_method) values(current_setting('ift.other')::uuid,current_setting('ift.fund')::uuid,1,'2026-11-06','cash'); raise exception 'Cross-owner link allowed'; exception when foreign_key_violation or insufficient_privilege then null; end;
  begin insert into public.personal_investment_funds(user_id,person_name,description,principal_cents,currency,received_on) values(current_setting('ift.owner')::uuid,'Forged owner','Forged',1,'USD','2026-11-06'); raise exception 'Foreign owner insert allowed'; exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claim.sub',current_setting('ift.owner'),true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('ift.owner'),'role','authenticated','is_anonymous',true)::text,true);
  if exists(select 1 from public.personal_investment_funds where id=current_setting('ift.fund')::uuid) then raise exception 'Anonymous JWT read allowed'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
  begin perform public.personal_investment_snapshot(); raise exception 'Anon snapshot allowed'; exception when insufficient_privilege then null; end;
  begin perform 1 from public.personal_investment_funds; raise exception 'Anon table read allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role service_role;
do $$ begin
  begin perform public.personal_investment_snapshot(); raise exception 'Service snapshot allowed'; exception when insufficient_privilege then null; end;
  begin perform 1 from public.personal_investment_repayments; raise exception 'Service table read allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select current_setting('ift.fund') as synthetic_fund_id, 'PASS owner/cross-owner/anonymous/service, overpayment, versions and history; rolled back' as verification;
rollback;
