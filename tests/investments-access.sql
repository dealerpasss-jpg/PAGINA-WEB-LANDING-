-- Execute on a disposable/staging database after the investment migration.
-- All fixtures are transaction-scoped and rolled back. No real users are changed.
begin;
insert into auth.users(id,aud,role,email,email_confirmed_at) values
('11111111-1111-4111-8111-111111111111','authenticated','authenticated','test-a@example.invalid',now()),
('22222222-2222-4222-8222-222222222222','authenticated','authenticated','test-b@example.invalid',now());
insert into public.investment_vehicles(id,title,purchased_on,purchase_cents) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','TEST A',current_date,420000),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','TEST B',current_date,500000);
insert into public.investment_members(vehicle_id,user_id,email,name) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','test-a@example.invalid','A'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','test-b@example.invalid','B');
insert into public.investment_expenses(vehicle_id,category,description,amount_cents,incurred_on) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','repair','Test A',13000,current_date),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','repair','Test B',20000,current_date);
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',true);
set local role authenticated;
do $$ declare n int; begin
 if (select count(*) from public.investment_vehicles)<>1 then raise exception 'Vehicle isolation failed'; end if;
 if (select count(*) from public.investment_expenses)<>1 then raise exception 'Expense isolation failed'; end if;
 if (select count(*) from public.investment_members)<>1 then raise exception 'Other investor exposed'; end if;
 update public.investment_vehicles set purchase_cents=0;
 get diagnostics n=row_count; if n<>0 then raise exception 'Investor write allowed'; end if;
end $$;
reset role;
update public.investment_members set revoked_at=now() where user_id='11111111-1111-4111-8111-111111111111';
set local role authenticated;
do $$ begin
 if exists(select 1 from public.investment_vehicles) or exists(select 1 from public.investment_expenses) then raise exception 'Revocation failed'; end if;
end $$;
reset role;
rollback;
