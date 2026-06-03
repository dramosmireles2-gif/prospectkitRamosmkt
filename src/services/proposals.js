import { supabase } from "./supabase";

function normalizeProposal(row) {
  return {
    id: row.id,
    prospectId: row.prospect_id,
    workspaceId: row.workspace_id,
    version: row.version,
    status: row.status,
    services: row.services || [],
    totalOriginal: row.total_original,
    totalNegotiated: row.total_negotiated,
    notes: row.notes || "",
    sentAt: row.sent_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listProposals(prospectId) {
  const { data, error } = await supabase
    .from("prospect_proposals")
    .select("*")
    .eq("prospect_id", prospectId)
    .order("version", { ascending: false });

  if (error) throw error;
  return (data || []).map(normalizeProposal);
}

export async function listAllProposals(workspaceId) {
  const { data, error } = await supabase
    .from("prospect_proposals")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(normalizeProposal);
}

export async function saveProposal(workspaceId, prospectId, payload, isNewVersion) {
  if (!isNewVersion && payload.id) {
    const { data, error } = await supabase
      .from("prospect_proposals")
      .update({
        status: payload.status,
        services: payload.services,
        total_original: payload.totalOriginal,
        total_negotiated: payload.totalNegotiated,
        notes: payload.notes,
        sent_at: payload.sentAt || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", payload.id)
      .select()
      .single();

    if (error) throw error;
    return normalizeProposal(data);
  }

  const { data, error } = await supabase
    .from("prospect_proposals")
    .insert({
      prospect_id: prospectId,
      workspace_id: workspaceId,
      version: payload.version,
      status: payload.status,
      services: payload.services,
      total_original: payload.totalOriginal,
      total_negotiated: payload.totalNegotiated,
      notes: payload.notes,
      sent_at: payload.sentAt || null
    })
    .select()
    .single();

  if (error) throw error;
  return normalizeProposal(data);
}
