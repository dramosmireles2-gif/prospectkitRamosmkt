import { useState } from "react";
import { theme } from "../../app/theme";
import { formatCurrency } from "../../utils/format";
import { formatServicePricing } from "../../services/serviceCatalog";
import { getActiveProposal, getProspectCommercialSnapshot } from "../../services/proposals";
import { EmptyState, Button } from "../../components/Primitives";
import { useAssetExport } from "./useAssetExport";
import { R, BASE, Brand, Glow } from "./shared";

const TEMPLATES = [
  { id: "opportunity-flyer", label: "Opportunity Flyer",  desc: "Oportunidades de crecimiento detectadas" },
  { id: "pain-point-flyer",  label: "Pain Point Flyer",   desc: "Problemas encontrados en el negocio" },
  { id: "competitor-flyer",  label: "Competitor Flyer",   desc: "Comparativa vs competidores del sector" },
  { id: "growth-flyer",      label: "Growth Flyer",       desc: "3 oportunidades de crecimiento rápido" },
  { id: "roi-flyer",         label: "ROI Flyer",          desc: "Inversión vs beneficio potencial" },
];

function ProspectingTemplate({ id, prospect, format, pricingSnapshot }) {
  const analysis = prospect.analysis;
  const displayServices = pricingSnapshot?.services?.length ? pricingSnapshot.services : analysis?.recommendedServices || [];
  const displayPricingSummary = pricingSnapshot?.pricingSummary || analysis?.pricingSummary || { oneTime: { min: 0 }, monthly: { min: 0 }, firstYear: { min: analysis?.revenue?.min || 0 } };
  const score = prospect.opportunityScore || 0;
  const scoreColor = score >= 85 ? R.accent : score >= 70 ? R.yellow : R.blue;
  const isStory = format?.id === "story";

  if (id === "opportunity-flyer") {
    const topServices = displayServices.slice(0, isStory ? 2 : 3);
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column" }}>
        <Glow color={R.accent} top={-80} right={-80} size={360} />
        {/* Header */}
        <div style={{ padding: isStory ? "52px 56px 28px" : "36px 56px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, background: `${scoreColor}18`, border: `1px solid ${scoreColor}44`, color: scoreColor, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
              Score {score}/100
            </div>
            <div style={{ fontSize: isStory ? 44 : 36, fontWeight: 900, color: R.text, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Detectamos oportunidades en
            </div>
            <div style={{ fontSize: isStory ? 44 : 36, fontWeight: 900, color: R.accent, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              {prospect.name}
            </div>
          </div>
          <Brand size="md" />
        </div>
        {/* Body: top opportunities */}
        <div style={{ flex: 1, padding: isStory ? "0 56px" : "0 56px", display: "flex", flexDirection: isStory ? "column" : "row", gap: 16 }}>
          {topServices.map((s, i) => {
            const barW = Math.max(40, 100 - i * 20);
            return (
              <div key={s.service} style={{ flex: 1, padding: "20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{s.icon || "🚀"}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: R.text, flex: 1 }}>{s.service}</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${barW}%`, borderRadius: 2, background: `linear-gradient(90deg, ${R.accent}, rgba(0,255,136,0.4))` }} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: R.accent }}>{formatServicePricing(s)}</div>
              </div>
            );
          })}
        </div>
        {/* Footer */}
        <div style={{ padding: isStory ? "24px 56px 40px" : "16px 56px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: R.muted, marginBottom: 4 }}>Potencial de ingreso estimado</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: R.text }}>
              {formatCurrency(displayPricingSummary.firstYear?.min || 0)}<span style={{ fontSize: 12, color: R.muted, fontWeight: 400 }}>/año</span>
            </div>
          </div>
          <div style={{ padding: "10px 24px", borderRadius: 8, background: R.accent, color: "#000", fontWeight: 800, fontSize: 13 }}>
            Solicita análisis completo
          </div>
        </div>
      </div>
    );
  }

  if (id === "pain-point-flyer") {
    const missingFeatures = analysis?.missingFeatures || [];
    const critical = missingFeatures.filter(f => f.critical);
    const nonCritical = missingFeatures.filter(f => !f.critical);
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column" }}>
        <Glow color={R.red} top={-60} right={-60} size={320} />
        <div style={{ padding: isStory ? "52px 56px 28px" : "36px 56px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, background: "rgba(255,68,85,0.12)", border: "1px solid rgba(255,68,85,0.3)", color: R.red, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
              Auditoría digital
            </div>
            <div style={{ fontSize: isStory ? 40 : 32, fontWeight: 900, color: R.text, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              Encontramos <span style={{ color: R.red }}>{missingFeatures.length} problemas</span> en {prospect.name}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, padding: "0 56px", display: "flex", flexDirection: isStory ? "column" : "row", gap: 20 }}>
          {critical.length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: R.red, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Críticos</div>
              {critical.slice(0, isStory ? 3 : 4).map(f => (
                <div key={f.name} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <span style={{ color: R.red, fontWeight: 900, fontSize: 14, flexShrink: 0, lineHeight: 1.4 }}>×</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{f.name}</span>
                </div>
              ))}
            </div>
          )}
          {nonCritical.length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: R.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Mejorables</div>
              {nonCritical.slice(0, isStory ? 3 : 4).map(f => (
                <div key={f.name} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <span style={{ color: R.dim, fontWeight: 900, fontSize: 14, flexShrink: 0, lineHeight: 1.4 }}>○</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{f.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: isStory ? "24px 56px 40px" : "16px 56px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: R.text }}>¿Quieres solucionarlos?</div>
          <Brand />
        </div>
      </div>
    );
  }

  if (id === "competitor-flyer") {
    const missingFeatures = analysis?.missingFeatures || [];
    const rows = [
      { label: "Sitio web",         has: !missingFeatures.find(f => f.name?.toLowerCase().includes("web")) },
      { label: "Redes sociales",    has: !missingFeatures.find(f => f.name?.toLowerCase().includes("red") || f.name?.toLowerCase().includes("social")) },
      { label: "Publicidad online", has: !missingFeatures.find(f => f.name?.toLowerCase().includes("pub") || f.name?.toLowerCase().includes("ads")) },
      { label: "Reseñas / Google",  has: !missingFeatures.find(f => f.name?.toLowerCase().includes("rese") || f.name?.toLowerCase().includes("google")) },
      { label: "App / E-commerce",  has: !missingFeatures.find(f => f.name?.toLowerCase().includes("app") || f.name?.toLowerCase().includes("tienda")) },
    ];
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isStory ? "52px 56px 28px" : "36px 56px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: isStory ? 38 : 30, fontWeight: 900, color: R.text, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              {prospect.name} vs competidores del sector
            </div>
            <div style={{ fontSize: 14, color: R.muted, marginTop: 6 }}>{prospect.industry}</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: "0 56px", display: "flex", flexDirection: "column", gap: 6 }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 160px", gap: 8, marginBottom: 8 }}>
            <div />
            <div style={{ textAlign: "center", fontSize: 11, color: R.text, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{prospect.name.split(" ")[0]}</div>
            <div style={{ textAlign: "center", fontSize: 11, color: R.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Competencia</div>
          </div>
          {rows.slice(0, isStory ? 4 : 5).map(row => (
            <div key={row.label} style={{ display: "grid", gridTemplateColumns: "1fr 120px 160px", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{row.label}</span>
              <div style={{ textAlign: "center", fontSize: 18 }}>{row.has ? <span style={{ color: R.accent }}>✓</span> : <span style={{ color: R.red }}>✗</span>}</div>
              <div style={{ textAlign: "center", fontSize: 18 }}><span style={{ color: R.accent }}>✓</span></div>
            </div>
          ))}
        </div>
        <div style={{ padding: isStory ? "24px 56px 40px" : "16px 56px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: R.text }}>Tu competencia ya lo tiene. ¿Y tú?</div>
          <Brand />
        </div>
      </div>
    );
  }

  if (id === "growth-flyer") {
    const wins = displayServices.slice(0, 3);
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column" }}>
        <Glow color={R.accent} top={-60} left={-60} size={340} />
        <div style={{ padding: isStory ? "52px 56px 28px" : "36px 56px 20px", flexShrink: 0 }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", color: R.accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            Quick Wins detectados
          </div>
          <div style={{ fontSize: isStory ? 44 : 36, fontWeight: 900, color: R.text, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            3 Quick Wins para <span style={{ color: R.accent }}>{prospect.name}</span>
          </div>
        </div>
        <div style={{ flex: 1, padding: "0 56px", display: "flex", flexDirection: isStory ? "column" : "row", gap: 16 }}>
          {wins.map((s, i) => (
            <div key={s.service} style={{ flex: 1, padding: "20px", background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.14)", borderRadius: 14, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>{s.icon || "🚀"}</span>
                <div style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(0,255,136,0.15)", color: R.accent, fontSize: 10, fontWeight: 700 }}>Alta prioridad</div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: R.text, marginBottom: 6 }}>{s.service}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: R.accent }}>{formatServicePricing(s)}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: isStory ? "24px 56px 40px" : "16px 56px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 16 }}>
          <Brand />
          <div style={{ fontSize: 14, color: R.muted }}>Podemos empezar esta semana</div>
        </div>
      </div>
    );
  }

  if (id === "roi-flyer") {
    const firstService = displayServices[0];
    const monthlyInvestment = displayPricingSummary.monthly?.min || 0;
    const oneTimeInvestment = displayPricingSummary.oneTime?.min || 0;
    const clientGain = firstService?.clientMonthlyGain || monthlyInvestment * 3.5;
    const roiPercent = monthlyInvestment > 0 ? Math.round(((clientGain - monthlyInvestment) / monthlyInvestment) * 100) : 0;
    const paybackMonths = clientGain > 0 ? Math.max(1, Math.round(oneTimeInvestment / clientGain)) : 3;
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Glow color={R.accent} top="50%" left="50%" size={400} />
        <div style={{ position: "absolute", top: isStory ? 52 : 28, left: 56, right: 56, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: isStory ? 36 : 28, fontWeight: 900, color: R.text }}>Análisis de ROI</div>
          <Brand />
        </div>
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: isStory ? "column" : "row", gap: 28, alignItems: "center", padding: "0 56px", width: "100%" }}>
          <div style={{ flex: 1, padding: "24px", background: "rgba(255,68,85,0.07)", border: "1px solid rgba(255,68,85,0.22)", borderRadius: 14 }}>
            <div style={{ fontSize: 11, color: "#ff6677", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Inversión mensual</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: R.text, letterSpacing: "-0.03em" }}>{formatCurrency(monthlyInvestment)}</div>
            <div style={{ fontSize: 12, color: R.muted, marginTop: 4 }}>+ {formatCurrency(oneTimeInvestment)} setup</div>
          </div>
          <div style={{ fontSize: 28, color: R.dim, fontWeight: 700 }}>→</div>
          <div style={{ flex: 1, padding: "24px", background: "rgba(0,255,136,0.07)", border: "1px solid rgba(0,255,136,0.22)", borderRadius: 14 }}>
            <div style={{ fontSize: 11, color: R.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Ganancia estimada</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: R.accent, letterSpacing: "-0.03em" }}>{formatCurrency(clientGain)}</div>
            <div style={{ fontSize: 12, color: R.muted, marginTop: 4 }}>por mes estimado</div>
          </div>
          <div style={{ flex: isStory ? undefined : "0 0 auto", textAlign: "center", padding: "24px 32px", background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 11, color: R.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>ROI estimado</div>
            <div style={{ fontSize: isStory ? 72 : 60, fontWeight: 900, color: R.accent, letterSpacing: "-0.04em", lineHeight: 1 }}>{roiPercent}%</div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: isStory ? 40 : 24, left: 56, right: 56, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 14, color: R.muted }}>Payback estimado: <strong style={{ color: R.text }}>{paybackMonths} {paybackMonths === 1 ? "mes" : "meses"}</strong></div>
          <div style={{ fontSize: 13, color: R.muted }}>Para {prospect.name}</div>
        </div>
      </div>
    );
  }

  return null;
}

export function ProspectingTab({ prospect, proposals = [], format }) {
  const [templateId, setTemplateId] = useState("opportunity-flyer");
  const [previewOpen, setPreviewOpen] = useState(false);
  const activeProposal = getActiveProposal(proposals);
  const pricingSnapshot = prospect ? getProspectCommercialSnapshot(prospect, activeProposal) : null;

  const slugName = prospect?.name?.toLowerCase().replace(/\s+/g, "-") || "rmkt";
  const { exportRef, downloading, message, download } = useAssetExport({
    filename: `rmkt-prospecting-${templateId}-${slugName}-${format?.id || "landscape"}`
  });

  const currentTemplate = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
  const previewScale = Math.min(600 / (format?.w || 1200), 340 / (format?.h || 630));
  const previewW = (format?.w || 1200) * previewScale;
  const previewH = (format?.h || 630) * previewScale;

  if (!prospect) {
    return (
      <div style={{ flex: 1 }}>
        <EmptyState title="Selecciona un prospecto" description="Selecciona un prospecto para generar Prospecting Assets." />
      </div>
    );
  }

  function renderTemplate(id) {
    return <ProspectingTemplate id={id} prospect={prospect} format={format} pricingSnapshot={pricingSnapshot} />;
  }

  return (
    <div style={{ flex: 1, height: "100%", display: "grid", gridTemplateColumns: "220px 1fr", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ borderRight: `1px solid ${theme.border}`, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 6, padding: "0 4px" }}>Plantillas</div>
        {TEMPLATES.map(item => (
          <div
            key={item.id}
            onClick={() => setTemplateId(item.id)}
            style={{ padding: "10px 13px", borderRadius: 9, cursor: "pointer", background: templateId === item.id ? theme.accentBg : "transparent", border: `1px solid ${templateId === item.id ? theme.accentBorder : "transparent"}` }}
          >
            <div style={{ fontSize: 12, fontWeight: templateId === item.id ? 700 : 500, color: templateId === item.id ? theme.accent : theme.text, marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 10, color: theme.muted, lineHeight: 1.4 }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Preview + footer */}
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#060606", padding: 28 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: previewW, height: previewH, overflow: "hidden", borderRadius: 10, boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)" }}>
              <div style={{ width: format?.w, height: format?.h, transform: `scale(${previewScale})`, transformOrigin: "top left" }}>
                {renderTemplate(templateId)}
              </div>
            </div>
            <div style={{ position: "absolute", bottom: -28, left: 0, right: 0, textAlign: "center", fontSize: 10, color: theme.muted }}>
              Vista previa · exporta en {format?.w}×{format?.h} px
            </div>
          </div>
        </div>
        <div style={{ minHeight: 66, borderTop: `1px solid ${theme.border}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 12, background: theme.s1, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{currentTemplate?.label} · {format?.label}</div>
            <div style={{ fontSize: 11, color: theme.muted }}>{downloading ? "Generando imagen..." : `${format?.w}×${format?.h} px`}</div>
          </div>
          {message && <span style={{ fontSize: 12, color: theme.accent, fontWeight: 600 }}>{message}</span>}
          <Button variant="ghost" size="md" onClick={() => setPreviewOpen(true)}>Ver en grande</Button>
          <Button variant="secondary" size="md" onClick={() => download("png", format?.w, format?.h)} disabled={downloading}>Descargar PNG</Button>
          <Button variant="primary" size="md" onClick={() => download("jpg", format?.w, format?.h)} disabled={downloading}>Descargar JPG</Button>
        </div>
      </div>

      {/* Off-screen export canvas */}
      <div style={{ position: "fixed", left: -4000, top: 0, width: format?.w, height: format?.h, pointerEvents: "none" }}>
        <div ref={exportRef} style={{ width: format?.w, height: format?.h }}>
          {renderTemplate(templateId)}
        </div>
      </div>

      {/* Preview modal */}
      {previewOpen && (
        <div onClick={() => setPreviewOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ position: "relative" }}>
            {(() => {
              const ms = Math.min((window.innerWidth * 0.82) / (format?.w || 1200), (window.innerHeight * 0.80) / (format?.h || 630));
              return (
                <>
                  <div style={{ width: (format?.w || 1200) * ms, height: (format?.h || 630) * ms, overflow: "hidden", borderRadius: 12, boxShadow: "0 32px 80px rgba(0,0,0,0.9)" }}>
                    <div style={{ width: format?.w, height: format?.h, transform: `scale(${ms})`, transformOrigin: "top left" }}>
                      {renderTemplate(templateId)}
                    </div>
                  </div>
                  <button onClick={() => setPreviewOpen(false)} style={{ position: "absolute", top: -14, right: -14, width: 32, height: 32, borderRadius: "50%", background: theme.s3, border: `1px solid ${theme.border}`, color: theme.muted, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
