import { supabase } from "./supabase";
import { getServiceCatalogItem, matchCatalogService, summarizeServicePricing } from "./serviceCatalog";

const PROPOSAL_STATUS_PRIORITY = ["aceptada", "negociacion", "enviada", "borrador"];

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

export function getActiveProposal(proposals = []) {
  if (!proposals?.length) return null;

  for (const status of PROPOSAL_STATUS_PRIORITY) {
    const matches = proposals.filter((proposal) => proposal.status === status);
    if (matches.length) {
      return [...matches].sort((left, right) => right.version - left.version || new Date(right.updatedAt || right.createdAt || 0) - new Date(left.updatedAt || left.createdAt || 0))[0];
    }
  }

  return [...proposals].sort((left, right) => right.version - left.version || new Date(right.updatedAt || right.createdAt || 0) - new Date(left.updatedAt || left.createdAt || 0))[0];
}

export function getActiveProposalMap(proposals = []) {
  const grouped = proposals.reduce((acc, proposal) => {
    if (!acc[proposal.prospectId]) acc[proposal.prospectId] = [];
    acc[proposal.prospectId].push(proposal);
    return acc;
  }, {});

  return Object.fromEntries(Object.entries(grouped).map(([prospectId, entries]) => [prospectId, getActiveProposal(entries)]));
}

export function getProposalPricingSummary(proposal) {
  return summarizeServicePricing(proposal?.services || []);
}

function enrichProposalService(service) {
  const catalog = getServiceCatalogItem(service?.id) || matchCatalogService(service?.service || "");
  return {
    ...catalog,
    ...service,
    id: service?.id || catalog?.id,
    catalogId: catalog?.id || service?.id,
    service: service?.service || catalog?.service || "Servicio",
    shortService: service?.shortService || catalog?.shortService || service?.service || catalog?.service || "Servicio",
    icon: service?.icon || catalog?.icon || "•",
    desc: service?.desc || catalog?.desc || "",
    billingType: service?.type || service?.billingType || catalog?.type || "mensual",
    billingNote: service?.billingNote || catalog?.billingNote || "",
    confidence: service?.confidence ?? 80
  };
}

export function getProspectCommercialSnapshot(prospect, activeProposal = null) {
  const analysisServices = prospect?.analysis?.recommendedServices || [];
  const analysisPricingSummary = prospect?.analysis?.pricingSummary || summarizeServicePricing(analysisServices);

  if (!activeProposal?.services?.length) {
    return {
      source: "analysis",
      proposal: null,
      services: analysisServices,
      pricingSummary: analysisPricingSummary
    };
  }

  const proposalServiceMap = Object.fromEntries(activeProposal.services.map((service) => [service.id, service]));
  const mergedServices = analysisServices.map((service) => {
    const proposalService = proposalServiceMap[service.catalogId || service.id];
    if (!proposalService) return service;

    return {
      ...service,
      ...proposalService,
      billingType: proposalService.type || service.billingType,
      oneTimePrice: proposalService.type === "unico" ? proposalService.negotiatedPrice : service.oneTimePrice,
      setupPrice: proposalService.type === "setup+mensual" ? (proposalService.negotiatedSetupPrice ?? proposalService.originalSetupPrice ?? service.setupPrice) : service.setupPrice,
      monthlyPrice:
        proposalService.type === "mensual" || proposalService.type === "setup+mensual"
          ? proposalService.negotiatedPrice
          : service.monthlyPrice
    };
  });

  const extraProposalServices = activeProposal.services.filter(
    (proposalService) => !mergedServices.some((service) => (service.catalogId || service.id) === proposalService.id)
  ).map((service) => enrichProposalService(service));

  return {
    source: "proposal",
    proposal: activeProposal,
    services: [...mergedServices, ...extraProposalServices],
    pricingSummary: getProposalPricingSummary(activeProposal)
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
