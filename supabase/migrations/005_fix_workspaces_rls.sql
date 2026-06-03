-- Fix RLS on workspaces table.
-- workspaces_select_member used is_workspace_member() which queries workspace_members.
-- After migration 003, workspace_members only allows auth.uid() = user_id,
-- but is_workspace_member() runs as the calling user's role without SECURITY DEFINER,
-- so it can fail intermittently during session bootstrap.
-- Replace with a direct EXISTS check that is self-contained and never recurses.

drop policy if exists "workspaces_select_member" on public.workspaces;
drop policy if exists "workspaces_update_owner" on public.workspaces;

create policy "workspaces_select_member"
on public.workspaces
for select
using (
  exists (
    select 1 from public.workspace_members
    where workspace_members.workspace_id = workspaces.id
      and workspace_members.user_id = auth.uid()
  )
);

create policy "workspaces_update_owner"
on public.workspaces
for update
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());
