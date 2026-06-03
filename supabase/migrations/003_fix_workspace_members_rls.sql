-- Fix circular RLS on workspace_members.
-- The previous policy called is_workspace_member() which itself queries
-- workspace_members, causing an infinite recursion that always returns empty.
-- Replace it with a direct auth.uid() = user_id check.

drop policy if exists "workspace_members_select_member" on public.workspace_members;

create policy "workspace_members_select_own"
on public.workspace_members
for select
using (auth.uid() = user_id);
