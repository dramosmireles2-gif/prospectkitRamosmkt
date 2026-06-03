import { demoProspects } from "../demo/seedData";
import { formatRelativeTime } from "../utils/format";
import { generateProspectAnalysis, generateProspectAnalysisAI, generateProspectKit, generateProspectKitAI, estimateOpportunityScore } from "./heuristics";
import { supabase } from "./supabase";

function normalizeAnalysis(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    prospectId: row.prospect_id,
    workspaceId: row.workspace_id,
    version: row.version,
    opportunityScore: row.opportunity_score,
    scoreLabel: row.score_label,
    scoreBreakdown: row.score_breakdown || [],
    missingFeatures: row.missing_features || [],
    recommendedServices: row.recommended_services || [],
    opportunities: row.opportunities || [],
    actionPlan: row.action_plan || [],
    revenue: {
      min: row.revenue_min || 0,
      max: row.revenue_max || 0
    },
    weaknesses: row.weaknesses || [],
    source: row.source
  };
}

function normalizeKit(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    prospectId: row.prospect_id,
    workspaceId: row.workspace_id,
    channelMessages: row.channel_messages,
    proposalSnapshot: row.proposal_snapshot
  };
}

function normalizeProspect(row) {
  const rawAnalysis = Array.isArray(row.prospect_analyses) ? row.prospect_analyses[0] : row.prospect_analyses;
  const rawKit = Array.isArray(row.prospect_kits) ? row.prospect_kits[0] : row.prospect_kits;
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    industry: row.industry,
    city: row.city,
    website: row.website || "",
    instagram: row.instagram || "",
    facebook: row.facebook || "",
    whatsapp: row.whatsapp || "",
    notes: row.notes || "",
    status: row.status,
    opportunityScore: row.opportunity_score || 0,
    lastActivityAt: row.last_activity_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastActivityLabel: formatRelativeTime(row.last_activity_at),
    analysis: normalizeAnalysis(rawAnalysis),
    kit: normalizeKit(rawKit)
  };
}

async function fetchProspectById(prospectId) {
  const { data, error } = await supabase
    .from("prospects")
    .select("*, prospect_analyses(*), prospect_kits(*)")
    .eq("id", prospectId)
    .single();

  if (error) {
    throw error;
  }

  return normalizeProspect(data);
}

export async function listProspects(workspaceId, { limit = 50, offset = 0 } = {}) {
  const { data, error, count } = await supabase
    .from("prospects")
    .select("*, prospect_analyses(*), prospect_kits(*)", { count: "exact" })
    .eq("workspace_id", workspaceId)
    .order("opportunity_score", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { prospects: (data || []).map(normalizeProspect), total: count || 0 };
}

export async function createProspect(workspaceId, input) {
  const opportunityScore = estimateOpportunityScore(input);
  const payload = {
    workspace_id: workspaceId,
    name: input.name.trim(),
    industry: input.industry.trim(),
    city: input.city.trim(),
    website: input.website?.trim() || null,
    instagram: input.instagram?.trim() || null,
    facebook: input.facebook?.trim() || null,
    whatsapp: input.whatsapp?.trim() || null,
    notes: input.notes?.trim() || null,
    status: "new",
    opportunity_score: opportunityScore,
    last_activity_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from("prospects").insert(payload).select("id").single();
  if (error) {
    throw error;
  }

  return fetchProspectById(data.id);
}

export async function updateProspect(input) {
  const { id, ...rest } = input;
  const payload = {
    ...rest,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase.from("prospects").update(payload).eq("id", id);
  if (error) {
    throw error;
  }

  return fetchProspectById(id);
}

export async function deleteProspect(prospectId) {
  const { error: kitError } = await supabase.from("prospect_kits").delete().eq("prospect_id", prospectId);
  if (kitError) throw kitError;

  const { error: analysisError } = await supabase.from("prospect_analyses").delete().eq("prospect_id", prospectId);
  if (analysisError) throw analysisError;

  const { error } = await supabase.from("prospects").delete().eq("id", prospectId);
  if (error) throw error;
}

export async function saveProspectAnalysis({ workspaceId, prospectId, analysis }) {
  const { error } = await supabase.from("prospect_analyses").upsert(
    {
      prospect_id: prospectId,
      workspace_id: workspaceId,
      version: analysis.version,
      opportunity_score: analysis.opportunityScore,
      score_label: analysis.scoreLabel,
      score_breakdown: analysis.scoreBreakdown,
      missing_features: analysis.missingFeatures,
      recommended_services: analysis.recommendedServices,
      opportunities: analysis.opportunities,
      action_plan: analysis.actionPlan,
      revenue_min: analysis.revenue.min,
      revenue_max: analysis.revenue.max,
      weaknesses: analysis.weaknesses,
      source: analysis.source,
      updated_at: new Date().toISOString()
    },
    { onConflict: "prospect_id" }
  );

  if (error) {
    throw error;
  }

  return updateProspect({
    id: prospectId,
    status: "analyzed",
    opportunity_score: analysis.opportunityScore,
    last_activity_at: new Date().toISOString()
  });
}

export async function saveProspectKit({ workspaceId, prospectId, kit }) {
  const { error } = await supabase.from("prospect_kits").upsert(
    {
      prospect_id: prospectId,
      workspace_id: workspaceId,
      channel_messages: kit.channelMessages,
      proposal_snapshot: kit.proposalSnapshot,
      updated_at: new Date().toISOString()
    },
    { onConflict: "prospect_id" }
  );

  if (error) {
    throw error;
  }

  return updateProspect({
    id: prospectId,
    status: "kit-ready",
    last_activity_at: new Date().toISOString()
  });
}

export async function ensureProspectAnalysis(workspaceId, prospect) {
  if (prospect.analysis) {
    return prospect;
  }

  let analysis;
  let usedFallback = false;

  try {
    analysis = await generateProspectAnalysisAI(prospect);
  } catch (error) {
    console.warn("Claude analysis unavailable; using heuristic fallback", {
      prospectId: prospect.id,
      message: error.message
    });
    analysis = generateProspectAnalysis(prospect);
    usedFallback = true;
  }

  try {
    return await saveProspectAnalysis({ workspaceId, prospectId: prospect.id, analysis });
  } catch (error) {
    console.error("Failed to save prospect analysis", {
      prospectId: prospect.id,
      workspaceId,
      source: analysis?.source,
      usedFallback,
      message: error.message
    });
    throw error;
  }
}

export async function regenerateProspectAnalysis(workspaceId, prospect) {
  let analysis;
  let usedFallback = false;

  try {
    analysis = await generateProspectAnalysisAI(prospect);
  } catch (error) {
    console.warn("Claude analysis unavailable; using heuristic fallback", {
      prospectId: prospect.id,
      message: error.message
    });
    analysis = generateProspectAnalysis(prospect);
    usedFallback = true;
  }

  try {
    return await saveProspectAnalysis({ workspaceId, prospectId: prospect.id, analysis });
  } catch (error) {
    console.error("Failed to save regenerated analysis", {
      prospectId: prospect.id,
      source: analysis?.source,
      usedFallback,
      message: error.message
    });
    throw error;
  }
}

export async function ensureProspectKit(workspaceId, prospect) {
  const analyzedProspect = prospect.analysis ? prospect : await ensureProspectAnalysis(workspaceId, prospect);
  if (analyzedProspect.kit) {
    return analyzedProspect;
  }

  let kit;
  try {
    kit = await generateProspectKitAI(analyzedProspect, analyzedProspect.analysis);
  } catch (error) {
    console.warn("Claude kit unavailable; using heuristic fallback", { message: error.message });
    kit = generateProspectKit(analyzedProspect, analyzedProspect.analysis);
  }

  return saveProspectKit({ workspaceId, prospectId: analyzedProspect.id, kit });
}

export async function regenerateProspectKit(workspaceId, prospect) {
  const analyzedProspect = prospect.analysis ? prospect : await ensureProspectAnalysis(workspaceId, prospect);

  let kit;
  try {
    kit = await generateProspectKitAI(analyzedProspect, analyzedProspect.analysis);
  } catch (error) {
    console.warn("Claude kit unavailable; using heuristic fallback", { message: error.message });
    kit = generateProspectKit(analyzedProspect, analyzedProspect.analysis);
  }

  return saveProspectKit({ workspaceId, prospectId: analyzedProspect.id, kit });
}

export async function getDashboardMetrics(workspaceId) {
  const { prospects } = await listProspects(workspaceId);
  return buildDashboardMetrics(prospects);
}

export function buildDashboardMetrics(prospects) {
  const rankedProspects = [...prospects].sort((a, b) => b.opportunityScore - a.opportunityScore);
  const totalProspects = prospects.length;
  const analyzedProspects = prospects.filter((prospect) => prospect.analysis).length;
  const kitsReady = prospects.filter((prospect) => prospect.kit).length;
  const revenueMinTotal = prospects.reduce((sum, prospect) => sum + (prospect.analysis?.revenue.min || 0), 0);
  const topProspect = rankedProspects.find((prospect) => prospect.analysis) || rankedProspects[0] || null;

  const recommendations = rankedProspects.slice(0, 4).map((prospect) => ({
    id: prospect.id,
    label: prospect.analysis ? `Pulir ${prospect.name}` : `Analizar ${prospect.name}`,
    desc: `${prospect.industry} - score ${prospect.opportunityScore}`,
    targetView: prospect.analysis ? "analysis" : "detail"
  }));

  return {
    totalProspects,
    analyzedProspects,
    kitsReady,
    revenueMinTotal,
    topProspect,
    rankedProspects,
    recommendations
  };
}

export async function seedDemoWorkspace(workspaceId) {
  const { prospects: existing } = await listProspects(workspaceId);
  if (existing.length > 0) {
    return existing;
  }

  for (const demo of demoProspects) {
    const created = await createProspect(workspaceId, demo);

    if (demo.status === "analyzed" || demo.status === "kit-ready" || demo.status === "contacted") {
      const analyzed = await ensureProspectAnalysis(workspaceId, created);
      if (demo.status === "kit-ready") {
        await ensureProspectKit(workspaceId, analyzed);
      } else if (demo.status === "contacted") {
        await updateProspect({
          id: analyzed.id,
          status: "contacted",
          last_activity_at: new Date().toISOString()
        });
      }
    }
  }

  const { prospects: allProspects } = await listProspects(workspaceId);
  return allProspects;
}
