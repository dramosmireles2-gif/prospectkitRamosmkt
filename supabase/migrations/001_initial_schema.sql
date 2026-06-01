create extension if not exists pgcrypto;

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  plan_code text,
  subscription_status text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (workspace_id, user_id)
);

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  industry text not null,
  city text not null,
  website text,
  instagram text,
  facebook text,
  whatsapp text,
  notes text,
  status text not null default 'new' check (status in ('new', 'analyzed', 'kit-ready', 'contacted')),
  opportunity_score integer not null default 50 check (opportunity_score between 0 and 100),
  last_activity_at timestamptz default timezone('utc'::text, now()),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.prospect_analyses (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null unique references public.prospects (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  version integer not null default 1,
  opportunity_score integer not null check (opportunity_score between 0 and 100),
  score_label text not null,
  score_breakdown jsonb not null default '[]'::jsonb,
  missing_features jsonb not null default '[]'::jsonb,
  recommended_services jsonb not null default '[]'::jsonb,
  opportunities jsonb not null default '[]'::jsonb,
  action_plan jsonb not null default '[]'::jsonb,
  revenue_min integer not null default 0,
  revenue_max integer not null default 0,
  weaknesses jsonb not null default '[]'::jsonb,
  source text not null default 'heuristic' check (source in ('heuristic', 'ai')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.prospect_kits (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null unique references public.prospects (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  channel_messages jsonb not null default '{}'::jsonb,
  proposal_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists prospects_workspace_id_idx on public.prospects (workspace_id);
create index if not exists workspace_members_user_id_idx on public.workspace_members (user_id);
create index if not exists prospect_analyses_workspace_id_idx on public.prospect_analyses (workspace_id);
create index if not exists prospect_kits_workspace_id_idx on public.prospect_kits (workspace_id);

create trigger set_prospects_updated_at
before update on public.prospects
for each row
execute procedure public.set_current_timestamp_updated_at();

create trigger set_prospect_analyses_updated_at
before update on public.prospect_analyses
for each row
execute procedure public.set_current_timestamp_updated_at();

create trigger set_prospect_kits_updated_at
before update on public.prospect_kits
for each row
execute procedure public.set_current_timestamp_updated_at();

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_members.workspace_id = target_workspace_id
      and workspace_members.user_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_name text;
  workspace_name text;
  workspace_slug text;
  new_workspace_id uuid;
begin
  base_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  workspace_name := base_name || ' Workspace';
  workspace_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9]+', '-', 'g'));
  workspace_slug := trim(both '-' from workspace_slug) || '-' || left(new.id::text, 8);

  insert into public.profiles (id, full_name)
  values (new.id, base_name)
  on conflict (id) do update set full_name = excluded.full_name;

  insert into public.workspaces (name, slug, owner_user_id, plan_code, subscription_status)
  values (workspace_name, workspace_slug, new.id, 'starter', 'active')
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner')
  on conflict (workspace_id, user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.prospects enable row level security;
alter table public.prospect_analyses enable row level security;
alter table public.prospect_kits enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "workspaces_select_member"
on public.workspaces
for select
using (public.is_workspace_member(id));

create policy "workspaces_update_owner"
on public.workspaces
for update
using (public.is_workspace_member(id) and owner_user_id = auth.uid())
with check (public.is_workspace_member(id) and owner_user_id = auth.uid());

create policy "workspace_members_select_member"
on public.workspace_members
for select
using (public.is_workspace_member(workspace_id));

create policy "workspace_members_insert_self_owner"
on public.workspace_members
for insert
with check (auth.uid() = user_id and public.is_workspace_member(workspace_id));

create policy "prospects_select_member"
on public.prospects
for select
using (public.is_workspace_member(workspace_id));

create policy "prospects_insert_member"
on public.prospects
for insert
with check (public.is_workspace_member(workspace_id));

create policy "prospects_update_member"
on public.prospects
for update
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "prospects_delete_member"
on public.prospects
for delete
using (public.is_workspace_member(workspace_id));

create policy "prospect_analyses_select_member"
on public.prospect_analyses
for select
using (public.is_workspace_member(workspace_id));

create policy "prospect_analyses_insert_member"
on public.prospect_analyses
for insert
with check (public.is_workspace_member(workspace_id));

create policy "prospect_analyses_update_member"
on public.prospect_analyses
for update
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "prospect_kits_select_member"
on public.prospect_kits
for select
using (public.is_workspace_member(workspace_id));

create policy "prospect_kits_insert_member"
on public.prospect_kits
for insert
with check (public.is_workspace_member(workspace_id));

create policy "prospect_kits_update_member"
on public.prospect_kits
for update
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));
