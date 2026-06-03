import { supabase } from "./supabase";
import { wait } from "../utils/format";

function normalizeWorkspace(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    ownerUserId: row.owner_user_id,
    planCode: row.plan_code,
    subscriptionStatus: row.subscription_status,
    createdAt: row.created_at
  };
}

function normalizeMember(row) {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    role: row.role,
    createdAt: row.created_at
  };
}

export async function getCurrentWorkspace(userId, attempt = 0) {
  // Two separate queries — avoids cross-table RLS join issues entirely
  const { data: member, error: memberError } = await supabase
    .from("workspace_members")
    .select("id, workspace_id, user_id, role, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (memberError) throw memberError;

  if (!member) {
    if (attempt < 4) {
      await wait(Math.min(500 * Math.pow(2, attempt), 4000));
      return getCurrentWorkspace(userId, attempt + 1);
    }
    return null;
  }

  const { data: ws, error: wsError } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", member.workspace_id)
    .maybeSingle();

  if (wsError) throw wsError;
  if (!ws) return null;

  return {
    workspace: normalizeWorkspace(ws),
    membership: normalizeMember(member)
  };
}
