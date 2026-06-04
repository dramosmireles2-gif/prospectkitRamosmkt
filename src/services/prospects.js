import { demoProspects } from "../demo/seedData";
import { formatRelativeTime } from "../utils/format";
import { generateProspectAnalysis, generateProspectKit, estimateOpportunityScore, estimateSalesLikelihoodScore, calcLeadTemperature } from "./heuristics";
import { summarizeServicePricing } from "./serviceCatalog";
import { supabase } from "./supabase";
import { STAGE_CADENCE } from "../app/constants";

function normalizeAnalysis(row) {
  if (!row) {
    return null;
  }

  const recommendedServices = row.recommended_services || [];
  const pricingSummary = summarizeServicePricing(recommendedServices);
  const revenueMin = row.revenue_min || pricingSummary.firstYear.min || 0;
  const revenueMax = row.revenue_max || pricingSummary.firstYear.max || 0;

  return {
    id: row.id,
    prospectId: row.prospect_id,
    workspaceId: row.workspace_id,
    version: row.version,
    opportunityScore: row.opportunity_score,
    scoreLabel: row.score_label,
    scoreBreakdown: row.score_breakdown || [],
    missingFeatures: row.missing_features || [],
    recommendedServices,
    opportunities: row.opportunities || [],
    actionPlan: row.action_plan || [],
    pricingSummary,
    revenue: {
      min: revenueMin,
      max: revenueMax
    },
    weaknesses: row.weaknesses || [],
    source: row.source,
    digitalDiagnosis: row.digital_diagnosis || null
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
    websiteUrl: row.website_url || null,
    socialNotes: row.social_notes || null,
    status: row.status,
    opportunityScore: row.opportunity_score || 0,
    salesLikelihoodScore: row.sales_likelihood_score || 0,
    leadTemperature: row.lead_temperature || "frio",
    pipelineStage: row.pipeline_stage || "lead",
    nextActionType: row.next_action_type || null,
    nextActionDate: row.next_action_date || null,
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
  const salesLikelihoodScore = estimateSalesLikelihoodScore(input);
  const leadTemperature = calcLeadTemperature(salesLikelihoodScore);
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
    website_url: input.websiteUrl?.trim() || null,
    social_notes: input.socialNotes?.trim() || null,
    status: "new",
    opportunity_score: opportunityScore,
    sales_likelihood_score: salesLikelihoodScore,
    lead_temperature: leadTemperature,
    pipeline_stage: "lead",
    last_activity_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from("prospects").insert(payload).select("id").single();
  if (error) {
    throw error;
  }

  return fetchProspectById(data.id);
}

export async function updateProspect(input) {
  const { id, websiteUrl, socialNotes, ...rest } = input;
  const payload = {
    ...rest,
    updated_at: new Date().toISOString()
  };
  if (websiteUrl !== undefined) payload.website_url = websiteUrl;
  if (socialNotes !== undefined) payload.social_notes = socialNotes;

  const { error } = await supabase.from("prospects").update(payload).eq("id", id);
  if (error) {
    throw error;
  }

  return fetchProspectById(id);
}

export async function updatePipelineStage(prospectId, stage) {
  const cadence = STAGE_CADENCE[stage];
  const nextDate = cadence
    ? new Date(Date.now() + cadence.days * 86400000).toISOString().split("T")[0]
    : null;
  const { error } = await supabase
    .from("prospects")
    .update({
      pipeline_stage: stage,
      next_action_type: cadence ? cadence.type : null,
      next_action_date: nextDate,
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", prospectId);
  if (error) throw error;
  return fetchProspectById(prospectId);
}

export async function updateNextAction(prospectId, { type, date }) {
  const { error } = await supabase
    .from("prospects")
    .update({ next_action_type: type || null, next_action_date: date || null, updated_at: new Date().toISOString() })
    .eq("id", prospectId);
  if (error) throw error;
  return fetchProspectById(prospectId);
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
      digital_diagnosis: analysis.digitalDiagnosis || null,
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

async function generateAnalysisWithAI(prospect) {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospect })
    });
    if (!response.ok) return null;
    const { analysis } = await response.json();
    return analysis || null;
  } catch {
    return null;
  }
}

export async function ensureProspectAnalysis(workspaceId, prospect) {
  if (prospect.analysis) {
    return prospect;
  }

  const aiAnalysis = await generateAnalysisWithAI(prospect);
  const analysis = aiAnalysis || generateProspectAnalysis(prospect);
  return saveProspectAnalysis({
    workspaceId,
    prospectId: prospect.id,
    analysis
  });
}

export async function regenerateProspectAnalysis(workspaceId, prospect) {
  const aiAnalysis = await generateAnalysisWithAI(prospect);
  const analysis = aiAnalysis || generateProspectAnalysis(prospect);
  return saveProspectAnalysis({
    workspaceId,
    prospectId: prospect.id,
    analysis
  });
}

export async function ensureProspectKit(workspaceId, prospect) {
  const analyzedProspect = prospect.analysis ? prospect : await ensureProspectAnalysis(workspaceId, prospect);
  if (analyzedProspect.kit) {
    return analyzedProspect;
  }

  const kit = generateProspectKit(analyzedProspect, analyzedProspect.analysis);
  return saveProspectKit({
    workspaceId,
    prospectId: analyzedProspect.id,
    kit
  });
}

export async function regenerateProspectKit(workspaceId, prospect) {
  const analyzedProspect = prospect.analysis ? prospect : await ensureProspectAnalysis(workspaceId, prospect);
  const kit = generateProspectKit(analyzedProspect, analyzedProspect.analysis);
  return saveProspectKit({
    workspaceId,
    prospectId: analyzedProspect.id,
    kit
  });
}

export async function getDashboardMetrics(workspaceId) {
  const { prospects } = await listProspects(workspaceId);
  return buildDashboardMetrics(prospects);
}

export function buildDashboardMetrics(prospects, activeProposalMap = {}) {
  const rankedProspects = [...prospects].sort((a, b) => b.opportunityScore - a.opportunityScore);
  const totalProspects = prospects.length;
  const analyzedProspects = prospects.filter((prospect) => prospect.analysis).length;
  const kitsReady = prospects.filter((prospect) => prospect.kit).length;
  const revenueMinTotal = prospects.reduce((sum, prospect) => {
    const proposalSummary = activeProposalMap[prospect.id]?.services?.length ? summarizeServicePricing(activeProposalMap[prospect.id].services) : null;
    return sum + (proposalSummary?.firstYear?.min || prospect.analysis?.pricingSummary?.firstYear?.min || prospect.analysis?.revenue.min || 0);
  }, 0);
  const monthlyPotentialTotal = prospects.reduce((sum, prospect) => {
    const proposalSummary = activeProposalMap[prospect.id]?.services?.length ? summarizeServicePricing(activeProposalMap[prospect.id].services) : null;
    return sum + (proposalSummary?.monthly?.min || prospect.analysis?.pricingSummary?.monthly?.min || 0);
  }, 0);
  const oneTimePotentialTotal = prospects.reduce((sum, prospect) => {
    const proposalSummary = activeProposalMap[prospect.id]?.services?.length ? summarizeServicePricing(activeProposalMap[prospect.id].services) : null;
    return sum + (proposalSummary?.oneTime?.min || prospect.analysis?.pricingSummary?.oneTime?.min || 0);
  }, 0);
  const topProspect = rankedProspects.find((prospect) => prospect.analysis) || rankedProspects[0] || null;

  const recommendations = rankedProspects.slice(0, 4).map((prospect) => ({
    id: prospect.id,
    label: prospect.analysis ? `Pulir ${prospect.name}` : `Analizar ${prospect.name}`,
    desc: `${prospect.industry} · score ${prospect.opportunityScore}`,
    targetView: prospect.analysis ? "analysis" : "detail"
  }));

  return {
    totalProspects,
    analyzedProspects,
    kitsReady,
    revenueMinTotal,
    monthlyPotentialTotal,
    oneTimePotentialTotal,
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
