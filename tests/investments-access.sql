-- Transaction-scoped fixtures. All writes below are rolled back.
begin;
select set_config('test.investor',gen_random_uuid()::text,true);
select set_config('test.vehicle',gen_random_uuid()::text,true);
insert into auth.users(id,aud,role,email,email_confirmed_at) values
(current_setting('test.investor')::uuid,'authenticated','authenticated',current_setting('test.investor')||'@example.invalid',now());
insert into public.profiles(id,email,role) values
(current_setting('test.investor')::uuid,current_setting('test.investor')||'@example.invalid','student') on conflict(id) do nothing;
insert into public.investment_vehicles(id,title,purchased_on,purchase_cents) values
(current_setting('test.vehicle')::uuid,'TRANSACTION TEST',null,null);
insert into public.investment_members(vehicle_id,user_id,email,name) values
(current_setting('test.vehicle')::uuid,current_setting('test.investor')::uuid,current_setting('test.investor')||'@example.invalid','Test investor');
insert into public.investment_expenses(vehicle_id,category,description,amount_cents,incurred_on) values
(current_setting('test.vehicle')::uuid,'repair','Transaction repair',13000,current_date);
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.investor'),'role','authenticated')::text,true);
set local role authenticated;
do $$ declare n int; begin
 if (select count(id) from public.investment_vehicles)<>1 then raise exception 'Assigned vehicle isolation failed'; end if;
 if exists(select 1 from public.investment_expenses) then raise exception 'Repair costs exposed'; end if;
 begin
  perform purchase_cents from public.investment_vehicles;
  raise exception 'Purchase cost exposed';
 exception when insufficient_privilege then null; end;
 begin
  perform notes from public.investment_vehicles;
  raise exception 'Private notes exposed';
 exception when insufficient_privilege then null; end;
 update public.investment_vehicles set purchase_cents=0;
 get diagnostics n=row_count;if n<>0 then raise exception 'Investor write allowed';end if;
end $$;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',(select id from public.profiles where role='admin' order by id limit 1),'role','authenticated')::text,true);
set local role authenticated;
do $$ declare n int; begin
 if not investment_private.is_admin() then raise exception 'Admin not verified';end if;
 update public.investment_vehicles set purchase_cents=420000,version=version+1 where id=current_setting('test.vehicle')::uuid;
 get diagnostics n=row_count;if n<>1 then raise exception 'Admin could not save purchase';end if;
 insert into public.investment_expenses(vehicle_id,category,description,amount_cents,incurred_on) values(current_setting('test.vehicle')::uuid,'repair','Second repair',7000,current_date);
 if (select sum(amount_cents) from public.investment_expenses where vehicle_id=current_setting('test.vehicle')::uuid)<>20000 then raise exception 'Repair total failed';end if;
 update public.investment_expenses set voided_at=now() where vehicle_id=current_setting('test.vehicle')::uuid and description='Second repair';
 if (select sum(amount_cents) from public.investment_expenses where vehicle_id=current_setting('test.vehicle')::uuid and voided_at is null)<>13000 then raise exception 'Void expense failed';end if;
end $$;
reset role;
do $$ begin
 if (select purchase_cents from public.investment_vehicles where id=current_setting('test.vehicle')::uuid)<>420000 then raise exception 'Saved purchase mismatch';end if;
end $$;
update public.investment_members set revoked_at=now() where user_id=current_setting('test.investor')::uuid;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.investor'),'role','authenticated')::text,true);
set local role authenticated;
do $$ begin
 if exists(select id from public.investment_vehicles) then raise exception 'Revocation failed';end if;
end $$;
reset role;
rollback;
select 'PASS: assigned vehicles, hidden costs, admin edits, repair totals, voiding and revocation; fixtures rolled back' as result;
