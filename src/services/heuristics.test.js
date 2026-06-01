import { describe, expect, it } from "vitest";
import { estimateOpportunityScore, generateProspectAnalysis, generateProspectKit } from "./heuristics";

const thinProspect = {
  name: "Taller Delta",
  industry: "Automotriz",
  city: "Guadalajara, JAL",
  website: "",
  instagram: "",
  facebook: "",
  whatsapp: "",
  notes: ""
};

const richProspect = {
  name: "Bella Cocina",
  industry: "Restaurante",
  city: "Monterrey, NL",
  website: "bellacocina.mx",
  instagram: "@bella",
  facebook: "Bella",
  whatsapp: "+52 81 1234 5678",
  notes: "Negocio activo"
};

describe("heuristics", () => {
  it("da más oportunidad a prospectos con menos madurez digital", () => {
    expect(estimateOpportunityScore(thinProspect)).toBeGreaterThan(estimateOpportunityScore(richProspect));
  });

  it("genera un análisis completo y consistente", () => {
    const analysis = generateProspectAnalysis(thinProspect);
    expect(analysis.opportunityScore).toBeGreaterThan(0);
    expect(analysis.scoreBreakdown).toHaveLength(5);
    expect(analysis.recommendedServices.length).toBeGreaterThan(0);
    expect(analysis.revenue.max).toBeGreaterThan(analysis.revenue.min);
  });

  it("genera kit a partir del análisis", () => {
    const analysis = generateProspectAnalysis(thinProspect);
    const kit = generateProspectKit(thinProspect, analysis);
    expect(kit.channelMessages.whatsapp).toContain("Taller Delta");
    expect(kit.proposalSnapshot.before.length).toBeGreaterThan(0);
    expect(kit.proposalSnapshot.after.length).toBeGreaterThan(0);
  });
});
