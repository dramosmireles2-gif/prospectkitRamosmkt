import { useRef, useState } from "react";
import { Button, Card, EmptyState } from "../components/Primitives";
import { theme } from "../app/theme";
import { formatCurrency } from "../utils/format";
import { useIsMobile } from "../hooks/useIsMobile";
import { formatServicePricing } from "../services/serviceCatalog";
import { getActiveProposal, getProspectCommercialSnapshot } from "../services/proposals";
import { INDUSTRIES } from "../app/constants";

// ─── Global design constants ─────────────────────────────────────────────────
const RMKT_COLORS = {
  bg: "#0a0a0f",
  accent: "#00ff88",
  yellow: "#ffbb44",
  blue: "#4a9eff",
  red: "#ff4455",
  text: "#f0f0f0",
  muted: "rgba(255,255,255,0.45)",
  dim: "rgba(255,255,255,0.25)",
  border: "rgba(255,255,255,0.08)"
};

const FORMATS = [
  { id: "landscape", label: "Landscape", w: 1200, h: 630 },
  { id: "square",    label: "Square",    w: 1080, h: 1080 },
  { id: "story",     label: "Story",     w: 1080, h: 1920 }
];

const baseStyle = {
  width: "100%",
  height: "100%",
  background: RMKT_COLORS.bg,
  color: RMKT_COLORS.text,
  fontFamily: "'DM Sans', system-ui, sans-serif",
  overflow: "hidden",
  position: "relative"
};

// ─── Brand component ──────────────────────────────────────────────────────────
function Brand({ size = "md" }) {
  const s = size === "sm" ? 18 : 24;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: s, height: s, borderRadius: 5, background: "#00ff88", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: s * 0.5, color: "#000" }}>R</div>
      <div>
        <div style={{ fontSize: size === "sm" ? 11 : 13, fontWeight: 700, color: "#f0f0f0", lineHeight: 1.1 }}>RamosMKT</div>
        <div style={{ fontSize: size === "sm" ? 8 : 9, color: "rgba(255,255,255,0.3)" }}>RMKT Growth</div>
      </div>
    </div>
  );
}

// ─── Template definitions ─────────────────────────────────────────────────────
const PROSPECTING_TEMPLATES = [
  { id: "score-card",          label: "Score Card",           desc: "Score de oportunidad" },
  { id: "audit-card",          label: "Audit Card",           desc: "Gaps digitales críticos" },
  { id: "quick-wins",          label: "Quick Wins",           desc: "3 oportunidades rápidas" },
  { id: "before-after",        label: "Before / After",       desc: "Comparativa situación" },
  { id: "opportunity-summary", label: "Opportunity Summary",  desc: "Score + top oportunidades" },
  { id: "roi-card",            label: "ROI Card",             desc: "Inversión vs ganancia" }
];

const SALES_TEMPLATES = [
  { id: "propuesta-visual",  label: "Propuesta Visual",   desc: "Visualización de propuesta" },
  { id: "roadmap",           label: "Roadmap",            desc: "Timeline de implementación" },
  { id: "comparativa",       label: "Comparativa",        desc: "Actual vs Con RamosMKT" },
  { id: "alcance-servicio",  label: "Alcance de Servicio",desc: "Scope of work visual" }
];

const MARKETING_TEMPLATES = [
  { id: "mkt-post",          label: "Instagram Post",     desc: "Publicación cuadrada" },
  { id: "mkt-carousel-1",   label: "Carousel 1/6",       desc: "Portada del proyecto" },
  { id: "mkt-carousel-2",   label: "Carousel 2/6",       desc: "El reto" },
  { id: "mkt-carousel-3",   label: "Carousel 3/6",       desc: "Nuestra solución" },
  { id: "mkt-carousel-4",   label: "Carousel 4/6",       desc: "Lo que construimos" },
  { id: "mkt-carousel-5",   label: "Carousel 5/6",       desc: "El resultado" },
  { id: "mkt-carousel-6",   label: "Carousel 6/6",       desc: "CTA" },
  { id: "mkt-meta-ad",      label: "Meta Ad",            desc: "Creativo para Meta Ads" },
  { id: "mkt-story",        label: "Story",              desc: "Historia vertical" },
  { id: "mkt-reel-cover",   label: "Reel Cover",         desc: "Cover para Reel" },
  { id: "mkt-case-study",   label: "Case Study",         desc: "Caso de éxito profesional" }
];

// ─── Prospecting Templates ────────────────────────────────────────────────────
function ProspectingTemplate({ id, prospect, format, pricingSnapshot }) {
  const analysis = prospect.analysis;
  const displayServices = pricingSnapshot?.services?.length ? pricingSnapshot.services : analysis?.recommendedServices || [];
  const displayPricingSummary = pricingSnapshot?.pricingSummary || analysis?.pricingSummary || { oneTime: { min: 0 }, monthly: { min: 0 }, firstYear: { min: analysis?.revenue?.min || 0 } };
  const score = prospect.opportunityScore;
  const color = score >= 85 ? RMKT_COLORS.accent : score >= 70 ? RMKT_COLORS.yellow : RMKT_COLORS.blue;
  const isStory = format?.id === "story";
  const colDir = isStory ? "column" : "row";

  if (id === "score-card") {
    return (
      <div style={baseStyle}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,136,0.07) 0%, transparent 60%)" }} />
        <div style={{ display: "flex", flexDirection: colDir, height: "100%" }}>
          <div style={{ flex: isStory ? "0 0 55%" : undefined, width: isStory ? "100%" : "58%", padding: isStory ? "56px 56px 36px" : "48px 56px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 20, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", color: RMKT_COLORS.accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 28 }}>
                Análisis digital
              </div>
              <div style={{ fontSize: isStory ? 52 : 44, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 10 }}>{prospect.name}</div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>{prospect.industry} · {prospect.city}</div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Score de oportunidad</span>
                  <span style={{ fontSize: 56, fontWeight: 900, color, letterSpacing: "-0.04em", lineHeight: 1 }}>{score}</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 3 }} />
                </div>
              </div>
            </div>
            <Brand />
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", borderLeft: isStory ? "none" : "1px solid rgba(255,255,255,0.07)", borderTop: isStory ? "1px solid rgba(255,255,255,0.07)" : "none", padding: isStory ? "32px 56px" : "48px 36px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>IA / heurística recomienda</div>
            {displayServices.slice(0, isStory ? 3 : 4).map((service) => (
              <div key={service.service} style={{ padding: "13px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <span style={{ fontSize: 18 }}>{service.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>{service.service}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{service.confidence}% confianza</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: RMKT_COLORS.accent }}>{formatServicePricing(service)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (id === "audit-card") {
    return (
      <div style={baseStyle}>
        <div style={{ padding: isStory ? "56px 54px" : "46px 54px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: RMKT_COLORS.accent, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Auditoría digital gratuita</div>
            <div style={{ fontSize: isStory ? 48 : 40, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.03em", marginBottom: 6 }}>{prospect.name}</div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>{prospect.industry} · {prospect.city}</div>
            <div style={{ display: "grid", gridTemplateColumns: isStory ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: 12 }}>
              {(analysis?.missingFeatures || []).slice(0, isStory ? 4 : 6).map((feature) => (
                <div key={feature.name} style={{ padding: "14px 16px", borderRadius: 10, background: feature.critical ? "rgba(255,68,85,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${feature.critical ? "rgba(255,68,85,0.25)" : "rgba(255,255,255,0.08)"}` }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: feature.critical ? "#ff4455" : "rgba(255,255,255,0.3)", marginBottom: 6 }}>{feature.critical ? "×" : "○"}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{feature.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", background: "rgba(255,68,85,0.06)", borderRadius: 10, border: "1px solid rgba(255,68,85,0.2)" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f0", marginBottom: 3 }}>
                Detectamos <span style={{ color: "#ff4455" }}>{analysis?.missingFeatures?.filter((item) => item.critical).length || 0} áreas críticas</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Solicita el análisis completo gratuito</div>
            </div>
            <Brand />
          </div>
        </div>
      </div>
    );
  }

  if (id === "quick-wins") {
    const wins = displayServices.slice(0, 3).map((s) => ({
      icon: s.icon || "🚀",
      name: s.service,
      revenue: formatServicePricing(s)
    }));
    const isRow = !isStory;
    return (
      <div style={baseStyle}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 60%, rgba(0,255,136,0.05) 0%, transparent 55%)" }} />
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "56px 52px" : "44px 56px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 20, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", color: RMKT_COLORS.accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
              Quick Wins detectados
            </div>
            <div style={{ fontSize: isStory ? 44 : 36, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.03em", marginBottom: 6 }}>{prospect.name}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>{prospect.industry} · {prospect.city}</div>
            <div style={{ display: "flex", flexDirection: isRow ? "row" : "column", gap: 16 }}>
              {wins.map((win, i) => (
                <div key={win.name} style={{ flex: 1, padding: "20px 20px", borderRadius: 14, background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.15)", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: isRow ? 36 : 30, lineHeight: 1 }}>{win.icon}</span>
                    <div style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(0,255,136,0.15)", color: RMKT_COLORS.accent, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>Quick Win</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0", marginBottom: 4 }}>{win.name}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: RMKT_COLORS.accent }}>{win.revenue}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Brand />
        </div>
      </div>
    );
  }

  if (id === "before-after") {
    const before = analysis?.weaknesses || ["Sin estructura digital clara", "Falta seguimiento comercial"];
    const after = prospect.kit?.proposalSnapshot?.after || ["Embudo más claro", "Mensajes listos para salir"];
    return (
      <div style={{ ...baseStyle, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isStory ? "36px 48px 24px" : "28px 48px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Propuesta digital para</div>
            <div style={{ fontSize: isStory ? 36 : 28, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.02em" }}>{prospect.name}</div>
          </div>
          <Brand />
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: isStory ? "1fr" : "1fr 1fr", gridTemplateRows: isStory ? "1fr 1fr" : undefined }}>
          <div style={{ padding: "32px 44px", background: "rgba(255,68,85,0.04)", borderRight: isStory ? "none" : "1px solid rgba(255,68,85,0.15)", borderBottom: isStory ? "1px solid rgba(255,68,85,0.15)" : "none" }}>
            <div style={{ fontSize: 12, color: "#ff4455", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 22 }}>Situación actual</div>
            {before.slice(0, isStory ? 3 : 5).map((item) => (
              <div key={item} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
                <span style={{ color: "#ff4455", fontWeight: 700, fontSize: 16, flexShrink: 0, lineHeight: 1.3 }}>×</span>
                <span style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: "32px 44px", background: "rgba(0,255,136,0.04)" }}>
            <div style={{ fontSize: 12, color: RMKT_COLORS.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 22 }}>Con RamosMKT</div>
            {after.slice(0, isStory ? 3 : 5).map((item) => (
              <div key={item} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
                <span style={{ color: RMKT_COLORS.accent, fontWeight: 700, fontSize: 16, flexShrink: 0, lineHeight: 1.3 }}>✓</span>
                <span style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (id === "opportunity-summary") {
    const topOps = displayServices.slice(0, 3);
    const breakdown = analysis?.scoreBreakdown || [];
    return (
      <div style={{ ...baseStyle, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isStory ? "40px 52px 24px" : "28px 52px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Resumen de oportunidad</div>
          <div style={{ fontSize: isStory ? 44 : 34, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.03em" }}>{prospect.name}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{prospect.industry} · {prospect.city}</div>
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: isStory ? "1fr" : "1fr 1fr", padding: "28px 52px", gap: 40 }}>
          {/* Left: score ring + breakdown */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
              <svg width={isStory ? 90 : 80} height={isStory ? 90 : 80} viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
                <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 213.6} 213.6`}
                  transform="rotate(-90 40 40)" />
                <text x="40" y="44" textAnchor="middle" fill={color} fontSize="22" fontWeight="900" fontFamily="system-ui">{score}</text>
              </svg>
              <div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Score de oportunidad</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#f0f0f0" }}>
                  {score >= 85 ? "Alta" : score >= 70 ? "Media-Alta" : "Media"}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 12 }}>Score por categoría</div>
            {breakdown.slice(0, 4).map((item) => (
              <div key={item.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{item.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: item.value < 40 ? RMKT_COLORS.accent : item.value < 70 ? "#ffbb44" : "rgba(255,255,255,0.4)" }}>{item.value}</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${item.value}%`, borderRadius: 2, background: item.value < 40 ? RMKT_COLORS.accent : item.value < 70 ? "#ffbb44" : "rgba(255,255,255,0.25)" }} />
                </div>
              </div>
            ))}
          </div>
          {/* Right: top opportunities */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 14 }}>Top oportunidades</div>
              {topOps.map((s, i) => {
                const barW = Math.max(30, 100 - i * 20);
                return (
                  <div key={s.service} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{s.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f0" }}>{s.service}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: RMKT_COLORS.accent }}>{formatServicePricing(s)}</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${barW}%`, borderRadius: 2, background: `linear-gradient(90deg, ${RMKT_COLORS.accent}, rgba(0,255,136,0.4))` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              <div style={{ padding: "12px 16px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.18)", borderRadius: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: RMKT_COLORS.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Potencial comercial</div>
                <div style={{ display: "flex", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#f0f0f0" }}>{formatCurrency(displayPricingSummary.oneTime?.min || 0)}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Inicial</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: RMKT_COLORS.accent }}>{formatCurrency(displayPricingSummary.monthly?.min || 0)}/mes</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Recurrente</div>
                  </div>
                </div>
              </div>
              <Brand />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (id === "roi-card") {
    const firstService = displayServices[0];
    const monthlyInvestment = displayPricingSummary.monthly?.min || 0;
    const oneTimeInvestment = displayPricingSummary.oneTime?.min || 0;
    const clientGain = firstService?.clientMonthlyGain || monthlyInvestment * 4;
    const roiPercent = monthlyInvestment > 0 ? Math.round(((clientGain - monthlyInvestment) / monthlyInvestment) * 100) : 0;
    const paybackMonths = clientGain > 0 ? Math.max(1, Math.round(oneTimeInvestment / clientGain)) : 3;
    return (
      <div style={{ ...baseStyle, display: "flex", flexDirection: "column" }}>
        <div style={{ position: "absolute", top: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 60%)" }} />
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "60px 56px" : "44px 60px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 20, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", color: RMKT_COLORS.accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
              Análisis de ROI
            </div>
            <div style={{ fontSize: isStory ? 48 : 38, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.03em", marginBottom: 8 }}>Inversión que se paga sola</div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>Para {prospect.name} · {prospect.industry}</div>
            <div style={{ display: "flex", flexDirection: isStory ? "column" : "row", gap: 20, marginBottom: 32 }}>
              <div style={{ flex: 1, padding: "20px 22px", background: "rgba(255,68,85,0.07)", border: "1px solid rgba(255,68,85,0.2)", borderRadius: 12 }}>
                <div style={{ fontSize: 11, color: "#ff6677", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Inversión mensual</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.03em" }}>{formatCurrency(monthlyInvestment)}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>+ {formatCurrency(oneTimeInvestment)} setup único</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "rgba(255,255,255,0.2)" }}>→</div>
              <div style={{ flex: 1, padding: "20px 22px", background: "rgba(0,255,136,0.07)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 12 }}>
                <div style={{ fontSize: 11, color: RMKT_COLORS.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Ganancia estimada</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: RMKT_COLORS.accent, letterSpacing: "-0.03em" }}>{formatCurrency(clientGain)}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>por mes estimado</div>
              </div>
            </div>
            <div style={{ textAlign: "center", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>ROI estimado</div>
              <div style={{ fontSize: 64, fontWeight: 900, color: RMKT_COLORS.accent, letterSpacing: "-0.04em", lineHeight: 1 }}>{roiPercent}%</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Payback estimado: <strong style={{ color: "#f0f0f0" }}>{paybackMonths} {paybackMonths === 1 ? "mes" : "meses"}</strong></div>
            <Brand />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Sales Templates ──────────────────────────────────────────────────────────
function SalesTemplate({ id, prospect, format, proposal, pricingSnapshot }) {
  const isStory = format?.id === "story";
  const isLandscape = format?.id === "landscape";
  const services = pricingSnapshot?.services || [];
  const summary = pricingSnapshot?.pricingSummary || { oneTime: { min: 0 }, monthly: { min: 0 }, firstYear: { min: 0 } };

  if (id === "propuesta-visual") {
    return (
      <div style={{ ...baseStyle, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isStory ? "36px 48px 20px" : "24px 48px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Propuesta para</div>
            <div style={{ fontSize: isStory ? 36 : 26, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.02em" }}>{prospect.name}</div>
          </div>
          <Brand />
        </div>
        <div style={{ flex: 1, padding: isStory ? "24px 48px" : "20px 48px", overflowY: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            {services.slice(0, isStory ? 4 : 6).map((s) => {
              const type = s.billingType || "monthly";
              const typeLabel = type === "one_time" ? "Pago único" : type === "setup_monthly" ? "Setup + mensual" : "Mensual";
              const typeColor = type === "one_time" ? RMKT_COLORS.blue : type === "setup_monthly" ? RMKT_COLORS.yellow : RMKT_COLORS.accent;
              return (
                <div key={s.service} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>{s.service}</div>
                  </div>
                  <div style={{ padding: "3px 10px", borderRadius: 20, background: `${typeColor}18`, border: `1px solid ${typeColor}44`, color: typeColor, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>{typeLabel}</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: RMKT_COLORS.accent, minWidth: 80, textAlign: "right" }}>{formatServicePricing(s)}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16, padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ flex: 1, textAlign: "center", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Pago inicial</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#f0f0f0" }}>{formatCurrency(summary.oneTime?.min || 0)}</div>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "12px", background: "rgba(0,255,136,0.05)", borderRadius: 10, border: "1px solid rgba(0,255,136,0.15)" }}>
              <div style={{ fontSize: 10, color: RMKT_COLORS.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Mensual recurrente</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: RMKT_COLORS.accent }}>{formatCurrency(summary.monthly?.min || 0)}</div>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Anual proyectado</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#f0f0f0" }}>{formatCurrency(summary.firstYear?.min || 0)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (id === "roadmap") {
    const phases = [
      { week: "Semana 1-2", title: "Setup y configuración", color: RMKT_COLORS.blue, bullets: ["Onboarding y accesos", "Configuración de cuentas", "Revisión de materiales"] },
      { week: "Semana 3-4", title: "Lanzamiento", color: RMKT_COLORS.accent, bullets: ["Publicación de contenido inicial", "Activación de campañas", "Pruebas de funcionalidad"] },
      { week: "Mes 2", title: "Optimización", color: RMKT_COLORS.yellow, bullets: ["Análisis de primeros datos", "Ajuste de estrategia", "Mejora de conversiones"] },
      { week: "Mes 3+", title: "Crecimiento", color: "#c084fc", bullets: ["Escalado de resultados", "Nuevas oportunidades", "Reporte de impacto"] }
    ];
    const isHoriz = isLandscape;
    return (
      <div style={{ ...baseStyle, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isStory ? "40px 48px 20px" : "24px 48px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Roadmap de implementación</div>
            <div style={{ fontSize: isStory ? 36 : 26, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.02em" }}>{prospect.name}</div>
          </div>
          <Brand />
        </div>
        <div style={{ flex: 1, padding: isStory ? "28px 48px" : "20px 48px", display: "flex", flexDirection: isHoriz ? "row" : "column", gap: 16, alignItems: "stretch" }}>
          {phases.map((phase, i) => (
            <div key={phase.title} style={{ flex: 1, padding: "18px 18px", background: "rgba(255,255,255,0.03)", border: `1px solid ${phase.color}22`, borderRadius: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: phase.color, flexShrink: 0 }} />
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{phase.week}</div>
              </div>
              <div style={{ fontSize: isHoriz ? 14 : 15, fontWeight: 800, color: "#f0f0f0", lineHeight: 1.3 }}>{phase.title}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {phase.bullets.map((b) => (
                  <div key={b} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                    <span style={{ color: phase.color, fontSize: 10, marginTop: 3, flexShrink: 0 }}>●</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (id === "comparativa") {
    const rows = [
      { label: "Website profesional" },
      { label: "Redes sociales activas" },
      { label: "Publicidad online" },
      { label: "Atención al cliente digital" },
      { label: "Analítica y reportes" },
      { label: "Reservas / pedidos online" }
    ];
    return (
      <div style={{ ...baseStyle, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isStory ? "40px 48px 20px" : "24px 52px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Situación comparativa</div>
            <div style={{ fontSize: isStory ? 36 : 26, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.02em" }}>{prospect.name}</div>
          </div>
          <Brand />
        </div>
        <div style={{ flex: 1, padding: isStory ? "24px 48px" : "16px 52px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 0, marginBottom: 8 }}>
            <div />
            <div style={{ width: isStory ? 110 : 130, textAlign: "center", fontSize: 11, color: "#ff6677", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 8px" }}>Actual</div>
            <div style={{ width: isStory ? 130 : 150, textAlign: "center", fontSize: 11, color: RMKT_COLORS.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 8px" }}>Con RamosMKT</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
            {rows.slice(0, isStory ? 5 : 6).map((row) => (
              <div key={row.label} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{row.label}</div>
                <div style={{ width: isStory ? 110 : 130, textAlign: "center", fontSize: 18, color: "#ff4455" }}>✗</div>
                <div style={{ width: isStory ? 130 : 150, textAlign: "center", fontSize: 18, color: RMKT_COLORS.accent }}>✓</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: "14px 18px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#f0f0f0" }}>¿Empezamos hoy?</div>
            <div style={{ padding: "8px 20px", borderRadius: 8, background: RMKT_COLORS.accent, color: "#000", fontSize: 13, fontWeight: 800 }}>Hablemos →</div>
          </div>
        </div>
      </div>
    );
  }

  if (id === "alcance-servicio") {
    const serviceDeliverables = {
      "Web": ["Landing page responsive", "Formulario de contacto", "Optimización básica SEO"],
      "SEO": ["Auditoría de palabras clave", "Optimización on-page", "Reporte mensual"],
      "Redes Sociales": ["Calendario de contenido", "Diseño de publicaciones", "Gestión de comunidad"],
      "Google Ads": ["Configuración de campañas", "Segmentación de audiencias", "Optimización mensual"],
      "Email Marketing": ["Secuencia de bienvenida", "Newsletters mensuales", "Automatizaciones básicas"]
    };
    return (
      <div style={{ ...baseStyle, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isStory ? "36px 48px 20px" : "22px 48px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Alcance del servicio</div>
            <div style={{ fontSize: isStory ? 34 : 24, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.02em" }}>{prospect.name}</div>
          </div>
          <Brand />
        </div>
        <div style={{ flex: 1, padding: isStory ? "20px 48px" : "16px 48px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "grid", gridTemplateColumns: isStory ? "1fr" : services.length >= 4 ? "repeat(2,1fr)" : "1fr 1fr", gap: 12, flex: 1 }}>
            {services.slice(0, isStory ? 3 : 4).map((s) => {
              const key = Object.keys(serviceDeliverables).find((k) => s.service?.toLowerCase().includes(k.toLowerCase())) || "Web";
              const deliverables = serviceDeliverables[key] || ["Entrega puntual", "Reporte de avance", "Soporte incluido"];
              return (
                <div key={s.service} style={{ padding: "16px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 22 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{s.service}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: RMKT_COLORS.accent }}>{formatServicePricing(s)}</div>
                    </div>
                  </div>
                  {deliverables.map((d) => (
                    <div key={d} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
                      <span style={{ color: RMKT_COLORS.accent, fontSize: 10, marginTop: 3 }}>●</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{d}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Setup</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#f0f0f0" }}>{formatCurrency(summary.oneTime?.min || 0)}</div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: RMKT_COLORS.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>Mensual</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: RMKT_COLORS.accent }}>{formatCurrency(summary.monthly?.min || 0)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Marketing Templates ──────────────────────────────────────────────────────
function MarketingTemplate({ id, project, format }) {
  const isStory = format?.id === "story";
  const isLandscape = format?.id === "landscape";
  const { businessName, industry, description, desktopImg, mobileImg, projectUrl } = project;
  const name = businessName || "Tu negocio";
  const desc = description || "Desarrollamos una solución digital completa";
  const shortDesc = desc.length > 80 ? desc.slice(0, 80) + "…" : desc;
  const longDesc = desc.length > 150 ? desc.slice(0, 150) + "…" : desc;

  const industryFeatures = {
    "Restaurante":    ["Carta digital online", "Reservas en tiempo real", "Pedidos a domicilio", "Reseñas automatizadas"],
    "Automotriz":     ["Catálogo de vehículos", "Citas de servicio online", "Presupuestos digitales", "Seguimiento de casos"],
    "Fotografía":     ["Portafolio interactivo", "Reservas de sesiones", "Galería privada de clientes", "Automatización de contratos"],
    "Salud":          ["Citas médicas online", "Expediente digital", "Recordatorios automáticos", "Telemedicina básica"],
    "Repostería":     ["Tienda online con personalización", "Pedidos por WhatsApp", "Catálogo visual", "Pagos en línea"],
    "Belleza":        ["Agenda de citas online", "Perfil de servicios", "Galería de trabajos", "Programa de lealtad"],
    "Fitness":        ["Reserva de clases", "Gestión de membresías", "App de seguimiento", "Contenido exclusivo"],
    "Inmobiliaria":   ["Listado de propiedades", "Tours virtuales", "CRM de prospectos", "Valuaciones online"],
    "Educación":      ["Plataforma de cursos", "Gestión de alumnos", "Pagos automatizados", "Certificaciones digitales"],
    "Legal":          ["Consultas online", "Gestión de casos", "Firma digital", "Portal del cliente"],
    "Veterinaria":    ["Citas online", "Historial de mascotas", "Recordatorios de vacunas", "Tienda de productos"],
    "Tecnología":     ["Landing page impactante", "Demo interactivo", "Pipeline de leads", "Integraciones API"]
  };
  const features = industryFeatures[industry] || ["Presencia digital profesional", "Gestión simplificada", "Más leads desde búsqueda local", "Panel de control centralizado"];

  const industryProblems = {
    "Restaurante": "Los clientes no podían reservar ni ver el menú fácilmente. Las redes eran inconsistentes y no generaban reservaciones.",
    "Automotriz": "Sin presencia digital clara, los clientes potenciales no encontraban el negocio en búsquedas locales.",
    "Fotografía": "El portafolio era difícil de navegar y no generaba contactos calificados de manera automática.",
    "Salud": "Los pacientes llamaban para agendar citas, saturando las líneas. No había recordatorios automáticos.",
    "Repostería": "Los pedidos llegaban por múltiples canales desordenados. No había forma de gestionar pedidos personalizados.",
    "Belleza": "La agenda se manejaba manualmente. Los clientes no sabían qué servicios había disponibles ni sus precios.",
    "Fitness": "Sin sistema de reservas, muchas clases quedaban vacías. Los miembros no tenían acceso a horarios actualizados.",
    "Inmobiliaria": "Los leads de propiedades se perdían sin seguimiento. El catálogo era difícil de actualizar.",
    "Educación": "No había forma de inscribirse online. Los pagos y certificados se gestionaban manualmente.",
    "Legal": "Los clientes no podían agendar consultas fácilmente. Sin portal, cada caso requería seguimiento manual.",
    "Veterinaria": "Las citas se agendaban por teléfono. Sin historial digital, cada visita era como la primera.",
    "Tecnología": "El sitio no transmitía confianza ni generaba demos ni trials de forma automatizada."
  };
  const problem = industryProblems[industry] || "La presencia digital era inexistente o inconsistente, generando pérdida de clientes potenciales.";

  const positiveResults = [
    "Presencia digital profesional y consistente",
    "Más leads desde búsqueda local en Google",
    "Procesos automatizados que ahorran tiempo"
  ];

  if (id === "mkt-post") {
    return (
      <div style={{ ...baseStyle, display: "flex", flexDirection: "column" }}>
        {desktopImg && (
          <div style={{ position: "absolute", inset: 0 }}>
            <img src={desktopImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,10,15,0.7) 0%, rgba(10,10,15,0.85) 100%)" }} />
          </div>
        )}
        {!desktopImg && (
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 30%, rgba(0,255,136,0.08) 0%, transparent 55%)" }} />
        )}
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "56px 52px" : "44px 52px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Brand size="md" />
          <div>
            <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 20, background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)", color: RMKT_COLORS.accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
              Nuevo proyecto
            </div>
            <div style={{ fontSize: isStory ? 56 : 44, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 10 }}>{name}</div>
            {industry && <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>{industry}</div>}
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, maxWidth: 520 }}>{shortDesc}</div>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            #RamosMKT #MarketingDigital {industry ? `#${industry.replace(/\s+/g, "")}` : ""}
          </div>
        </div>
      </div>
    );
  }

  if (id === "mkt-carousel-1") {
    return (
      <div style={{ ...baseStyle }}>
        {desktopImg && (
          <div style={{ position: "absolute", inset: 0 }}>
            <img src={desktopImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.6) 100%)" }} />
          </div>
        )}
        {!desktopImg && (
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 40% 50%, rgba(0,255,136,0.07) 0%, transparent 60%)" }} />
        )}
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "72px 56px" : "56px 64px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Brand />
          <div>
            <div style={{ fontSize: 11, color: RMKT_COLORS.accent, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Caso de éxito</div>
            <div style={{ fontSize: isStory ? 64 : 52, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 12 }}>{name}</div>
            {industry && <div style={{ fontSize: 18, color: "rgba(255,255,255,0.45)" }}>{industry}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>1 / 6</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Desliza →</div>
          </div>
        </div>
      </div>
    );
  }

  if (id === "mkt-carousel-2") {
    return (
      <div style={{ ...baseStyle, display: "flex", flexDirection: "column" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 20%, rgba(255,68,85,0.06) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "72px 56px" : "56px 64px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Brand size="sm" />
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>2 / 6</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#ff6677", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>El reto</div>
            <div style={{ fontSize: isStory ? 52 : 42, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 24 }}>¿Cuál era el problema?</div>
            <div style={{ fontSize: isStory ? 18 : 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, maxWidth: 560 }}>{problem}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 24, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
            <div style={{ width: 24, height: 3, borderRadius: 2, background: "#ff4455" }} />
            {[...Array(4)].map((_, i) => <div key={i} style={{ width: 24, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)" }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (id === "mkt-carousel-3") {
    const solution = features.slice(0, 3);
    return (
      <div style={{ ...baseStyle, display: "flex", flexDirection: "column" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 70%, rgba(0,255,136,0.06) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "72px 56px" : "56px 64px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Brand size="sm" />
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>3 / 6</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: RMKT_COLORS.accent, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>Nuestra solución</div>
            <div style={{ fontSize: isStory ? 50 : 40, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 28 }}>Lo que implementamos</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {solution.map((item, i) => (
                <div key={item} style={{ display: "flex", gap: 16, alignItems: "center", padding: "14px 18px", background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0,255,136,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: RMKT_COLORS.accent, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#f0f0f0" }}>{item}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[...Array(2)].map((_, i) => <div key={i} style={{ width: 24, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />)}
            <div style={{ width: 24, height: 3, borderRadius: 2, background: RMKT_COLORS.accent }} />
            {[...Array(3)].map((_, i) => <div key={i} style={{ width: 24, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)" }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (id === "mkt-carousel-4") {
    return (
      <div style={{ ...baseStyle, display: "flex", flexDirection: "column" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 40%, rgba(74,158,255,0.05) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "72px 56px" : "56px 64px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Brand size="sm" />
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>4 / 6</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: RMKT_COLORS.blue, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>Lo que construimos</div>
            <div style={{ fontSize: isStory ? 50 : 40, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 28 }}>Funcionalidades entregadas</div>
            <div style={{ display: "grid", gridTemplateColumns: isLandscape ? "repeat(2,1fr)" : "1fr", gap: 12 }}>
              {features.slice(0, isLandscape ? 4 : 4).map((feat) => (
                <div key={feat} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 16px", background: "rgba(74,158,255,0.05)", border: "1px solid rgba(74,158,255,0.15)", borderRadius: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: RMKT_COLORS.blue, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[...Array(3)].map((_, i) => <div key={i} style={{ width: 24, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />)}
            <div style={{ width: 24, height: 3, borderRadius: 2, background: RMKT_COLORS.blue }} />
            {[...Array(2)].map((_, i) => <div key={i} style={{ width: 24, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)" }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (id === "mkt-carousel-5") {
    return (
      <div style={{ ...baseStyle, display: "flex", flexDirection: "column" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(0,255,136,0.05) 0%, transparent 55%)" }} />
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "72px 56px" : "56px 64px", height: "100%", display: "flex", flexDirection: isLandscape ? "row" : "column", justifyContent: "space-between", gap: isLandscape ? 40 : 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: isLandscape ? "flex-start" : "center", flexDirection: isLandscape ? "column" : "row", flexShrink: 0 }}>
            <Brand size="sm" />
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>5 / 6</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: RMKT_COLORS.accent, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>El resultado</div>
            <div style={{ fontSize: isStory ? 48 : 38, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 24 }}>Así quedó el proyecto</div>
            {mobileImg ? (
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <img src={mobileImg} alt="" style={{ width: isLandscape ? 140 : 100, borderRadius: 12, flexShrink: 0, border: "2px solid rgba(0,255,136,0.2)" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {positiveResults.map((r) => (
                    <div key={r} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: RMKT_COLORS.accent, fontSize: 14, fontWeight: 900, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {positiveResults.map((r) => (
                  <div key={r} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 16px", background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 10 }}>
                    <span style={{ color: RMKT_COLORS.accent, fontSize: 16, fontWeight: 900, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{r}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (id === "mkt-carousel-6") {
    return (
      <div style={{ ...baseStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(0,255,136,0.1) 0%, transparent 60%)" }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: isStory ? "60px 56px" : "50px 64px", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>6 / 6</div>
          <div>
            <div style={{ fontSize: isStory ? 52 : 42, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>¿Tu negocio necesita esto?</div>
            <div style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", marginBottom: 36 }}>Desarrollamos presencia digital que genera resultados reales.</div>
            <div style={{ padding: "14px 36px", borderRadius: 10, background: RMKT_COLORS.accent, color: "#000", fontSize: 17, fontWeight: 900, display: "inline-block", letterSpacing: "0.02em" }}>Hablemos →</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Brand />
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>ramosmkt.com</div>
          </div>
        </div>
      </div>
    );
  }

  if (id === "mkt-meta-ad") {
    return (
      <div style={{ ...baseStyle }}>
        {desktopImg && (
          <div style={{ position: "absolute", inset: 0 }}>
            <img src={desktopImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,15,0.62)" }} />
          </div>
        )}
        {!desktopImg && (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,255,136,0.08) 0%, rgba(10,10,15,1) 60%)" }} />
        )}
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "64px 52px" : "48px 60px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ padding: "6px 16px", borderRadius: 20, background: RMKT_COLORS.accent, color: "#000", fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>CASO DE ÉXITO</div>
            <Brand size="sm" />
          </div>
          <div>
            <div style={{ fontSize: isStory ? 52 : 42, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 24, maxWidth: 560 }}>
              Así transformamos la presencia digital de <span style={{ color: RMKT_COLORS.accent }}>{name}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {positiveResults.map((r) => (
                <div key={r} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: RMKT_COLORS.accent, fontSize: 12, fontWeight: 900 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#f0f0f0", marginBottom: 4 }}>¿Quieres lo mismo para tu negocio?</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>ramosmkt.com</div>
            </div>
            <div style={{ padding: "12px 28px", borderRadius: 9, background: RMKT_COLORS.accent, color: "#000", fontSize: 15, fontWeight: 900 }}>Contáctanos</div>
          </div>
        </div>
      </div>
    );
  }

  if (id === "mkt-story") {
    return (
      <div style={{ ...baseStyle }}>
        {mobileImg && (
          <div style={{ position: "absolute", inset: 0 }}>
            <img src={mobileImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,10,15,0.8) 0%, rgba(10,10,15,0.3) 40%, rgba(10,10,15,0.85) 80%)" }} />
          </div>
        )}
        {!mobileImg && desktopImg && (
          <div style={{ position: "absolute", inset: 0 }}>
            <img src={desktopImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,10,15,0.8) 0%, rgba(10,10,15,0.3) 40%, rgba(10,10,15,0.85) 80%)" }} />
          </div>
        )}
        {!mobileImg && !desktopImg && (
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(0,255,136,0.1) 0%, transparent 60%)" }} />
        )}
        <div style={{ position: "relative", zIndex: 1, padding: "60px 48px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Brand />
          <div>
            <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 20, background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)", color: RMKT_COLORS.accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 18 }}>
              Nuevo proyecto
            </div>
            <div style={{ fontSize: 56, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 12 }}>{name}</div>
            {industry && <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>{industry}</div>}
            <div style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, maxWidth: 420, marginBottom: 28 }}>{shortDesc}</div>
          </div>
          <div>
            <div style={{ padding: "14px 24px", borderRadius: 10, background: RMKT_COLORS.accent, color: "#000", fontSize: 16, fontWeight: 900, display: "inline-block", marginBottom: 16 }}>
              Ver enlace en bio ↑
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              #RamosMKT #MarketingDigital {industry ? `#${industry.replace(/\s+/g, "")}` : ""}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (id === "mkt-reel-cover") {
    return (
      <div style={{ ...baseStyle }}>
        {desktopImg && (
          <div style={{ position: "absolute", inset: 0 }}>
            <img src={desktopImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,10,15,0.5) 0%, rgba(10,10,15,0.85) 70%)" }} />
          </div>
        )}
        {!desktopImg && (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(10,10,15,1) 50%)" }} />
        )}
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "60px 52px" : "44px 56px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Brand size="sm" />
          </div>
          <div>
            <div style={{ fontSize: isStory ? 80 : 60, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 10 }}>Así quedó ▶</div>
            <div style={{ fontSize: 20, color: "rgba(255,255,255,0.6)", fontWeight: 600, marginBottom: 6 }}>{name}</div>
            {industry && <div style={{ fontSize: 15, color: "rgba(255,255,255,0.35)" }}>{industry}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(0,255,136,0.15)", border: "2px solid rgba(0,255,136,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 18, marginLeft: 3 }}>▶</span>
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Ver reel completo</div>
          </div>
        </div>
      </div>
    );
  }

  if (id === "mkt-case-study") {
    return (
      <div style={{ ...baseStyle, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isStory ? "40px 52px 20px" : "24px 52px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Brand />
            <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ fontSize: 11, color: RMKT_COLORS.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Caso de éxito</div>
          </div>
          {desktopImg && (
            <img src={desktopImg} alt="" style={{ width: 80, height: 52, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }} />
          )}
        </div>
        <div style={{ flex: 1, padding: isStory ? "28px 52px" : "20px 52px", display: "flex", flexDirection: isLandscape ? "row" : "column", gap: isLandscape ? 36 : 20 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 8 }}>Cliente</div>
              <div style={{ fontSize: isStory ? 32 : 26, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.02em", marginBottom: 4 }}>{name}</div>
              {industry && <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{industry}</div>}
            </div>
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 8 }}>El proyecto</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>{longDesc}</div>
            </div>
          </div>
          <div style={{ flex: isLandscape ? "0 0 300px" : 1, display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 10 }}>Resultado</div>
              {positiveResults.map((r) => (
                <div key={r} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <span style={{ color: RMKT_COLORS.accent, fontSize: 13, fontWeight: 900, flexShrink: 0, marginTop: 2 }}>✓</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{r}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 16px", background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.18)", borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>¿Quieres resultados similares?</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: RMKT_COLORS.accent }}>ramosmkt.com</div>
              {projectUrl && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{projectUrl}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────
export function AssetsScreen({ prospect, proposals = [] }) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("prospecting");
  const [templateId, setTemplateId] = useState("score-card");
  const [formatId, setFormatId] = useState("landscape");
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [project, setProject] = useState({ businessName: "", industry: "", projectUrl: "", description: "", desktopImg: null, mobileImg: null });
  const exportRef = useRef(null);
  const desktopImgRef = useRef(null);
  const mobileImgRef = useRef(null);

  const fmt = FORMATS.find((f) => f.id === formatId) || FORMATS[0];
  const activeProposal = getActiveProposal(proposals);
  const pricingSnapshot = getProspectCommercialSnapshot(prospect, activeProposal);

  const tabTemplates = activeTab === "prospecting" ? PROSPECTING_TEMPLATES : activeTab === "sales" ? SALES_TEMPLATES : MARKETING_TEMPLATES;

  const previewScale = Math.min(600 / fmt.w, 340 / fmt.h);
  const previewW = fmt.w * previewScale;
  const previewH = fmt.h * previewScale;

  function handleTabChange(tab) {
    setActiveTab(tab);
    const first = tab === "prospecting" ? PROSPECTING_TEMPLATES[0] : tab === "sales" ? SALES_TEMPLATES[0] : MARKETING_TEMPLATES[0];
    setTemplateId(first.id);
  }

  function handleFileChange(field, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProject((p) => ({ ...p, [field]: ev.target.result }));
    reader.readAsDataURL(file);
  }

  function renderTemplate(id, ref) {
    if (activeTab === "prospecting") {
      if (!prospect) return null;
      return <ProspectingTemplate id={id} prospect={prospect} format={fmt} pricingSnapshot={pricingSnapshot} />;
    }
    if (activeTab === "sales") {
      if (!prospect) return null;
      return <SalesTemplate id={id} prospect={prospect} format={fmt} proposal={activeProposal} pricingSnapshot={pricingSnapshot} />;
    }
    return <MarketingTemplate id={id} project={project} format={fmt} />;
  }

  async function download(fileFormat) {
    if (!exportRef.current || downloading) return;
    setDownloading(true);
    setMessage("Renderizando...");
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(exportRef.current, {
        scale: 1,
        backgroundColor: "#0a0a0f",
        useCORS: true,
        logging: false,
        width: fmt.w,
        height: fmt.h
      });
      const link = document.createElement("a");
      const slugName = activeTab === "marketing" ? (project.businessName || "rmkt") : (prospect?.name || "rmkt");
      const slug = slugName.toLowerCase().replace(/\s+/g, "-");
      link.download = `rmkt-${templateId}-${slug}-${formatId}.${fileFormat}`;
      link.href = canvas.toDataURL(fileFormat === "jpg" ? "image/jpeg" : "image/png", 0.95);
      link.click();
      setMessage("Descargado");
    } catch {
      setMessage("Error al generar");
    } finally {
      setDownloading(false);
      setTimeout(() => setMessage(""), 2200);
    }
  }

  const headerTitle = activeTab === "marketing" ? "Marketing Assets" : activeTab === "sales" ? "Sales Assets" : "Prospecting Assets";
  const headerSub = activeTab === "marketing" ? "Proyectos realizados por RamosMKT" : prospect?.name || "Selecciona un prospecto";

  const showEmptyState = (activeTab === "prospecting" || activeTab === "sales") && !prospect;
  const showNoProposal = activeTab === "sales" && prospect && !activeProposal;

  const currentTemplate = tabTemplates.find((t) => t.id === templateId) || tabTemplates[0];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ minHeight: 58, borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", flexWrap: "nowrap", padding: "0 28px", gap: 16, background: theme.bg, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.dim, marginBottom: 2, letterSpacing: "0.04em" }}>{headerSub}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>{headerTitle}</div>
        </div>
        {message ? <span style={{ fontSize: 12, color: theme.accent, fontWeight: 600 }}>{message}</span> : null}
        <Button variant="secondary" size="sm" onClick={() => download("png")} disabled={downloading}>PNG</Button>
        <Button variant="primary" size="sm" onClick={() => download("jpg")} disabled={downloading}>JPG</Button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${theme.border}`, background: theme.bg, flexShrink: 0 }}>
        {[{ id: "prospecting", label: "Prospecting" }, { id: "sales", label: "Sales" }, { id: "marketing", label: "Marketing" }].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            style={{
              padding: "11px 22px",
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 700 : 400,
              color: activeTab === tab.id ? theme.accent : theme.muted,
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${activeTab === tab.id ? theme.accent : "transparent"}`,
              cursor: "pointer",
              letterSpacing: "0.02em",
              transition: "color 0.15s"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty state for prospecting/sales without prospect */}
      {showEmptyState ? (
        <div style={{ flex: 1 }}>
          <EmptyState title="Selecciona un prospecto" description="Los assets de Prospecting y Sales se generan con los datos del prospecto seleccionado." />
        </div>
      ) : (
        <div style={{ flex: 1, overflow: "hidden", display: "grid", gridTemplateColumns: isMobile ? "1fr" : activeTab === "marketing" ? "280px 1fr" : "220px 1fr" }}>
          {/* Sidebar */}
          <div style={{ borderRight: isMobile ? "none" : `1px solid ${theme.border}`, borderBottom: isMobile ? `1px solid ${theme.border}` : "none", padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>

            {/* Marketing project form */}
            {activeTab === "marketing" && (
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 10, color: theme.dim, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 10, padding: "0 4px" }}>Datos del proyecto</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Nombre del negocio"
                    value={project.businessName}
                    onChange={(e) => setProject((p) => ({ ...p, businessName: e.target.value }))}
                    style={{ background: theme.s2 || "rgba(255,255,255,0.05)", border: `1px solid ${theme.border}`, borderRadius: 8, padding: "8px 12px", color: theme.text, fontSize: 12, outline: "none" }}
                  />
                  <select
                    value={project.industry}
                    onChange={(e) => setProject((p) => ({ ...p, industry: e.target.value }))}
                    style={{ background: theme.s2 || "rgba(255,255,255,0.05)", border: `1px solid ${theme.border}`, borderRadius: 8, padding: "8px 12px", color: project.industry ? theme.text : theme.muted, fontSize: 12, outline: "none" }}
                  >
                    <option value="">Industria...</option>
                    {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                  <input
                    type="url"
                    placeholder="URL del proyecto (opcional)"
                    value={project.projectUrl}
                    onChange={(e) => setProject((p) => ({ ...p, projectUrl: e.target.value }))}
                    style={{ background: theme.s2 || "rgba(255,255,255,0.05)", border: `1px solid ${theme.border}`, borderRadius: 8, padding: "8px 12px", color: theme.text, fontSize: 12, outline: "none" }}
                  />
                  <textarea
                    placeholder="Descripción del proyecto..."
                    value={project.description}
                    onChange={(e) => setProject((p) => ({ ...p, description: e.target.value }))}
                    rows={3}
                    style={{ background: theme.s2 || "rgba(255,255,255,0.05)", border: `1px solid ${theme.border}`, borderRadius: 8, padding: "8px 12px", color: theme.text, fontSize: 12, outline: "none", resize: "vertical" }}
                  />
                  {/* Desktop image upload */}
                  <div>
                    <div style={{ fontSize: 10, color: theme.dim, marginBottom: 4 }}>Captura desktop</div>
                    <div
                      onClick={() => desktopImgRef.current?.click()}
                      style={{ border: `2px dashed ${project.desktopImg ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.12)"}`, borderRadius: 10, padding: "12px", cursor: "pointer", textAlign: "center", background: "rgba(255,255,255,0.02)" }}
                    >
                      {project.desktopImg
                        ? <img src={project.desktopImg} style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: 6 }} />
                        : <div style={{ fontSize: 11, color: theme.dim }}>+ Subir captura desktop</div>
                      }
                    </div>
                    <input ref={desktopImgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFileChange("desktopImg", e)} />
                  </div>
                  {/* Mobile image upload */}
                  <div>
                    <div style={{ fontSize: 10, color: theme.dim, marginBottom: 4 }}>Captura móvil</div>
                    <div
                      onClick={() => mobileImgRef.current?.click()}
                      style={{ border: `2px dashed ${project.mobileImg ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.12)"}`, borderRadius: 10, padding: "12px", cursor: "pointer", textAlign: "center", background: "rgba(255,255,255,0.02)" }}
                    >
                      {project.mobileImg
                        ? <img src={project.mobileImg} style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: 6 }} />
                        : <div style={{ fontSize: 11, color: theme.dim }}>+ Subir captura móvil</div>
                      }
                    </div>
                    <input ref={mobileImgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFileChange("mobileImg", e)} />
                  </div>
                  <button
                    onClick={() => setProject({ businessName: "", industry: "", projectUrl: "", description: "", desktopImg: null, mobileImg: null })}
                    style={{ background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 8, padding: "7px 12px", color: theme.muted, fontSize: 11, cursor: "pointer" }}
                  >
                    Limpiar proyecto
                  </button>
                </div>
                <div style={{ height: 1, background: theme.border, margin: "14px 0" }} />
              </div>
            )}

            {/* No proposal warning for sales */}
            {showNoProposal && (
              <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,187,68,0.08)", border: "1px solid rgba(255,187,68,0.2)", marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#ffbb44", marginBottom: 4 }}>Sin propuesta activa</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>Crea una propuesta para generar Sales Assets con datos reales.</div>
              </div>
            )}

            {/* Template list */}
            <div style={{ fontSize: 10, color: theme.dim, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 6, padding: "0 4px" }}>Plantillas</div>
            {tabTemplates.map((item) => (
              <div
                key={item.id}
                onClick={() => setTemplateId(item.id)}
                style={{
                  padding: "10px 13px",
                  borderRadius: 9,
                  cursor: "pointer",
                  background: templateId === item.id ? theme.accentBg : "transparent",
                  border: `1px solid ${templateId === item.id ? theme.accentBorder : "transparent"}`
                }}
              >
                <div style={{ fontSize: 12, fontWeight: templateId === item.id ? 700 : 500, color: templateId === item.id ? theme.accent : theme.text, marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 10, color: theme.muted, lineHeight: 1.4 }}>{item.desc}</div>
              </div>
            ))}

            {/* Format selector */}
            <div style={{ marginTop: 12, padding: "12px 4px 4px", borderTop: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: 10, color: theme.dim, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>Formato</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {FORMATS.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setFormatId(f.id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      background: formatId === f.id ? theme.accentBg : "transparent",
                      border: `1px solid ${formatId === f.id ? theme.accentBorder : theme.border}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: formatId === f.id ? 700 : 400, color: formatId === f.id ? theme.accent : theme.text }}>{f.label}</span>
                    <span style={{ fontSize: 10, color: theme.dim }}>{f.w}×{f.h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview area */}
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#060606", padding: isMobile ? 16 : 28 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: previewW, height: previewH, overflow: "hidden", borderRadius: 10, boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)" }}>
                  <div style={{ width: fmt.w, height: fmt.h, transform: `scale(${previewScale})`, transformOrigin: "top left" }}>
                    {renderTemplate(templateId)}
                  </div>
                </div>
                <div style={{ position: "absolute", bottom: -28, left: 0, right: 0, textAlign: "center", fontSize: 10, color: theme.dim }}>
                  Vista previa · exporta en {fmt.w}×{fmt.h} px
                </div>
              </div>
            </div>

            <div style={{ minHeight: 66, borderTop: `1px solid ${theme.border}`, display: "flex", alignItems: "center", flexWrap: "nowrap", padding: "0 24px", gap: 12, background: theme.s1, flexShrink: 0 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{currentTemplate?.label} · {fmt.label}</div>
                <div style={{ fontSize: 11, color: theme.muted }}>{downloading ? "Generando imagen..." : `${fmt.w}×${fmt.h} px`}</div>
              </div>
              <Button variant="ghost" size="md" onClick={() => setPreviewOpen(true)}>Ver en grande</Button>
              <Button variant="secondary" size="md" onClick={() => download("png")} disabled={downloading}>Descargar PNG</Button>
              <Button variant="primary" size="md" onClick={() => download("jpg")} disabled={downloading}>Descargar JPG</Button>
            </div>
          </div>
        </div>
      )}

      {/* Off-screen export canvas */}
      <div style={{ position: "fixed", left: -4000, top: 0, width: fmt.w, height: fmt.h, pointerEvents: "none" }}>
        <div ref={exportRef} style={{ width: fmt.w, height: fmt.h }}>
          {!showEmptyState && renderTemplate(templateId)}
        </div>
      </div>

      {/* Preview modal */}
      {previewOpen ? (
        <div
          onClick={() => setPreviewOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
            {(() => {
              const modalScale = Math.min((window.innerWidth * 0.82) / fmt.w, (window.innerHeight * 0.80) / fmt.h);
              const mw = fmt.w * modalScale;
              const mh = fmt.h * modalScale;
              return (
                <>
                  <div style={{ width: mw, height: mh, overflow: "hidden", borderRadius: 12, boxShadow: "0 32px 80px rgba(0,0,0,0.9)" }}>
                    <div style={{ width: fmt.w, height: fmt.h, transform: `scale(${modalScale})`, transformOrigin: "top left" }}>
                      {!showEmptyState && renderTemplate(templateId)}
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewOpen(false)}
                    style={{ position: "absolute", top: -14, right: -14, width: 32, height: 32, borderRadius: "50%", background: theme.s3, border: `1px solid ${theme.border}`, color: theme.muted, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >×</button>
                  <div style={{ marginTop: 12, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                    {fmt.w}×{fmt.h} px · clic fuera para cerrar
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      ) : null}
    </div>
  );
}
