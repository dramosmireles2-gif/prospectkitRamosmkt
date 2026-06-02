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

  it("reconoce industrias nuevas (belleza, fitness, inmobiliaria)", () => {
    const belleza = generateProspectAnalysis({ ...thinProspect, industry: "Belleza" });
    expect(belleza.recommendedServices.length).toBeGreaterThan(0);

    const fitness = generateProspectAnalysis({ ...thinProspect, industry: "Gimnasio" });
    expect(fitness.recommendedServices.length).toBeGreaterThan(0);

    const inmob = generateProspectAnalysis({ ...thinProspect, industry: "Inmobiliaria" });
    expect(inmob.recommendedServices.length).toBeGreaterThan(0);
  });

  it("genera kit con email que contiene subject y body", () => {
    const analysis = generateProspectAnalysis(richProspect);
    const kit = generateProspectKit(richProspect, analysis);
    expect(kit.channelMessages.email.subject).toBeTruthy();
    expect(kit.channelMessages.email.body).toContain("Bella Cocina");
  });

  it("produce revenue max mayor que revenue min", () => {
    const analysis = generateProspectAnalysis(thinProspect);
    expect(analysis.revenue.max).toBeGreaterThan(analysis.revenue.min);
    expect(analysis.revenue.min).toBeGreaterThan(0);
  });

  it("clampa score entre 40 y 96", () => {
    expect(estimateOpportunityScore(thinProspect)).toBeLessThanOrEqual(96);
    expect(estimateOpportunityScore(thinProspect)).toBeGreaterThanOrEqual(40);
    expect(estimateOpportunityScore(richProspect)).toBeLessThanOrEqual(96);
    expect(estimateOpportunityScore(richProspect)).toBeGreaterThanOrEqual(40);
  });
});
