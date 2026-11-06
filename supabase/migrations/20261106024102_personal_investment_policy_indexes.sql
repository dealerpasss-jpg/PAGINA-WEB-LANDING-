-- Index the direct owner foreign key and common private-ledger date ordering.
create index personal_investment_repayments_owner_date_idx
  on public.personal_investment_repayments(user_id,paid_on desc,id);

-- Both forms produce InitPlans in PostgreSQL. Normalize the scalar subquery
-- to the conventional auth helper shape recognized by the performance advisor.
-- Ownership, anonymous-session exclusions, policy roles and grants are unchanged.
alter policy personal_investment_funds_select_own on public.personal_investment_funds
  using ((select auth.uid()) = user_id and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false));
alter policy personal_investment_funds_insert_own on public.personal_investment_funds
  with check ((select auth.uid()) = user_id and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false));
alter policy personal_investment_funds_update_own on public.personal_investment_funds
  using ((select auth.uid()) = user_id and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false))
  with check ((select auth.uid()) = user_id and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false));
alter policy personal_investment_repayments_select_own on public.personal_investment_repayments
  using ((select auth.uid()) = user_id and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false));
alter policy personal_investment_repayments_insert_own on public.personal_investment_repayments
  with check ((select auth.uid()) = user_id and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false));
alter policy personal_investment_repayments_update_own on public.personal_investment_repayments
  using ((select auth.uid()) = user_id and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false))
  with check ((select auth.uid()) = user_id and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false));
