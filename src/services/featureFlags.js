export const FEATURES = {
  CRM: "crm",
  ANALYSIS: "analysis",
  KIT_GENERATION: "kit_generation",
  ASSET_EXPORT: "asset_export",
  TEAM_MEMBERS: "team_members",
  BILLING: "billing"
};

export const PLAN_CATALOG = {
  starter: {
    code: "starter",
    name: "Starter",
    features: [FEATURES.CRM, FEATURES.ANALYSIS, FEATURES.KIT_GENERATION, FEATURES.ASSET_EXPORT]
  },
  agency: {
    code: "agency",
    name: "Agency",
    features: [
      FEATURES.CRM,
      FEATURES.ANALYSIS,
      FEATURES.KIT_GENERATION,
      FEATURES.ASSET_EXPORT,
      FEATURES.TEAM_MEMBERS,
      FEATURES.BILLING
    ]
  }
};

export function canUse(feature, workspace) {
  if (!workspace) {
    return false;
  }

  const code = workspace.planCode || "starter";
  const plan = PLAN_CATALOG[code] || PLAN_CATALOG.starter;
  return plan.features.includes(feature);
}
