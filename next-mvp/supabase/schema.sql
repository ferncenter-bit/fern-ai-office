-- Run in Supabase SQL Editor. Requires Supabase Authentication enabled.
create extension if not exists pgcrypto;
create table if not exists public.runs (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 command text not null check (char_length(command) between 5 and 2000),
 status text not null default 'working' check (status in ('working','waiting_approval','approved','rejected','revision_requested','failed')),
 summary text,
 created_at timestamptz not null default now()
);
create table if not exists public.agent_outputs (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 run_id uuid not null references public.runs(id) on delete cascade,
 agent_id text not null check (agent_id in ('nova','miko','ledger','orbit','pixel','echo')),
 content text not null,
 created_at timestamptz not null default now()
);
create index if not exists runs_user_created_idx on public.runs(user_id,created_at desc);
create index if not exists outputs_run_idx on public.agent_outputs(run_id);
alter table public.runs enable row level security;
alter table public.agent_outputs enable row level security;
create policy "User reads own runs" on public.runs for select to authenticated using (user_id=auth.uid());
create policy "User inserts own runs" on public.runs for insert to authenticated with check (user_id=auth.uid());
create policy "User updates own runs" on public.runs for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "User reads own outputs" on public.agent_outputs for select to authenticated using (user_id=auth.uid());
create policy "User writes own outputs" on public.agent_outputs for insert to authenticated with check (user_id=auth.uid() and exists (select 1 from public.runs r where r.id=run_id and r.user_id=auth.uid()));
-- Do not allow public/anonymous reads or writes.
