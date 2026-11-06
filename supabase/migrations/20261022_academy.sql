-- Run once in the dedicated DealerPass Supabase project. No client writes to billing or roles.
create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, email text not null, role text not null default 'student' check(role in ('student','collaborator','admin')), created_at timestamptz not null default now());
create table public.purchases (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id), plan text not null check(plan in ('starter','academy','pro','elite')), session_id text unique, status text not null default 'pending', created_at timestamptz not null default now());
create unique index one_pending_checkout on public.purchases(user_id) where status='pending';
create table public.vip_applications (user_id uuid primary key references public.profiles(id), phone text not null, experience text not null, goals text not null, status text not null default 'requested' check(status in ('requested','meeting','approved','rejected')), meeting_at timestamptz, review_note text, reviewed_by uuid references public.profiles(id), updated_at timestamptz not null default now(), check(status <> 'approved' or (meeting_at is not null and review_note is not null and length(review_note)>10 and reviewed_by is not null)));
create table public.lessons (id uuid primary key default gen_random_uuid(), title text not null, module_title text not null, position integer not null default 0, body text not null default '', asset_path text, allowed_plans text[] not null default '{}', published boolean not null default false, check(allowed_plans <@ ARRAY['starter','academy','pro','elite']::text[]));
create table public.lesson_progress (user_id uuid references public.profiles(id) on delete cascade, lesson_id uuid references public.lessons(id) on delete cascade, completed_at timestamptz not null default now(), primary key(user_id,lesson_id));
create table public.academy_audit (id bigint generated always as identity primary key, actor uuid references public.profiles(id), action text not null, target text not null, created_at timestamptz not null default now());
create table public.stripe_events (id text primary key, type text not null, processed_at timestamptz not null default now());
-- All reads and writes go through authenticated, authorized server handlers.
alter table public.profiles enable row level security;
alter table public.purchases enable row level security;
alter table public.vip_applications enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.academy_audit enable row level security;
alter table public.stripe_events enable row level security;
revoke all on public.profiles,public.purchases,public.vip_applications,public.lessons,public.lesson_progress,public.academy_audit,public.stripe_events from anon,authenticated;
insert into storage.buckets(id,name,public) values ('academy-private','academy-private',false) on conflict(id) do nothing;
-- Keep storage private; do not add anon/authenticated object policies.
