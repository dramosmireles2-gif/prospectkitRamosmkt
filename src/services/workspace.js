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
  const { data, error } = await supabase
    .from("workspace_members")
    .select("id, workspace_id, user_id, role, created_at, workspaces(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data && attempt < 4) {
    const delay = Math.min(500 * Math.pow(2, attempt), 4000);
    await wait(delay);
    return getCurrentWorkspace(userId, attempt + 1);
  }

  if (!data) {
    return null;
  }

  // If the JOIN returned the workspace, use it directly
  if (data.workspaces) {
    return {
      workspace: normalizeWorkspace(data.workspaces),
      membership: normalizeMember(data)
    };
  }

  // Fallback: RLS may have blocked the JOIN — fetch workspace separately
  const { data: wsData, error: wsError } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", data.workspace_id)
    .maybeSingle();

  if (wsError) throw wsError;
  if (!wsData) return null;

  return {
    workspace: normalizeWorkspace(wsData),
    membership: normalizeMember(data)
  };
}
