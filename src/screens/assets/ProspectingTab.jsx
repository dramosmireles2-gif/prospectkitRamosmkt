import { useState } from "react";
import { theme } from "../../app/theme";
import { formatCurrency } from "../../utils/format";
import { formatServicePricing } from "../../services/serviceCatalog";
import { getActiveProposal, getProspectCommercialSnapshot } from "../../services/proposals";
import { EmptyState, Button } from "../../components/Primitives";
import { useAssetExport } from "./useAssetExport";
import { R, BASE, Brand, Glow } from "./shared";

const TEMPLATES = [
  { id: "diagnostico-digital", label: "Diagnóstico Digital", desc: "Score, top 3 servicios y problemas críticos detectados" },
  { id: "crecimiento-rapido",  label: "Quick Wins",          desc: "3 oportunidades de crecimiento rápido con impacto" },
  { id: "propuesta-inicial",   label: "Propuesta Inicial",   desc: "Servicios recomendados, precios y CTA de cierre" },
];

function ProspectingTemplate({ id, prospect, format, pricingSnapshot }) {
  const analysis = prospect.analysis;
  const displayServices = pricingSnapshot?.services?.length ? pricingSnapshot.services : analysis?.recommendedServices || [];
  const displayPricingSummary = pricingSnapshot?.pricingSummary || analysis?.pricingSummary || { oneTime: { min: 0 }, monthly: { min: 0 }, firstYear: { min: analysis?.revenue?.min || 0 } };
  const score = prospect.opportunityScore || 0;
  const scoreColor = score >= 85 ? R.accent : score >= 70 ? R.yellow : R.blue;
  const isStory = format?.id === "story";
  const isLandscape = format?.id === "landscape";

  if (id === "diagnostico-digital") {
    const missingFeatures = analysis?.missingFeatures || [];
    const critical = missingFeatures.filter(f => f.critical).slice(0, isStory ? 2 : 3);
    const topServices = displayServices.slice(0, isStory ? 2 : 3);
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column" }}>
        <Glow color={R.red} top={-60} right={-60} size={300} />
        <Glow color={R.accent} bottom={-60} left={-60} size={260} />
        {/* Header */}
        <div style={{ padding: isStory ? "48px 56px 24px" : "32px 56px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ padding: "4px 12px", borderRadius: 20, background: `${scoreColor}18`, border: `1px solid ${scoreColor}44`, color: scoreColor, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Score {score}/100
              </div>
            </div>
            <div style={{ fontSize: isStory ? 40 : 30, fontWeight: 900, color: R.text, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              Diagnóstico digital de
            </div>
            <div style={{ fontSize: isStory ? 40 : 30, fontWeight: 900, color: R.accent, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              {prospect.name}
            </div>
          </div>
          <Brand size="md" />
        </div>
        {/* Body */}
        <div style={{ flex: 1, padding: "0 56px", display: "flex", flexDirection: isLandscape ? "row" : "column", gap: 18 }}>
          {/* Problems column */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: R.red, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Problemas críticos</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {critical.length > 0 ? critical.map(f => (
                <div key={f.name} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 14px", background: "rgba(255,68,85,0.07)", border: "1px solid rgba(255,68,85,0.2)", borderRadius: 10 }}>
                  <span style={{ color: R.red, fontWeight: 900, fontSize: 14, flexShrink: 0 }}>×</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>{f.name}</span>
                </div>
              )) : (
                <div style={{ fontSize: 13, color: R.muted, padding: "10px 14px" }}>Sin problemas críticos detectados.</div>
              )}
            </div>
          </div>
          {/* Opportunities column */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: R.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Top servicios recomendados</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topServices.map(s => (
                <div key={s.service} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>{s.icon || "🚀"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: R.text }}>{s.service}</div>
                    <div style={{ fontSize: 12, color: R.accent, fontWeight: 700 }}>{formatServicePricing(s)}</div>
                  </div>
                  <span style={{ color: R.accent, fontSize: 16 }}>✓</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Footer */}
        <div style={{ padding: isStory ? "20px 56px 36px" : "14px 56px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 16 }}>
          <div style={{ fontSize: 13, color: R.muted }}>Potencial primer año: <strong style={{ color: R.text }}>{formatCurrency(displayPricingSummary.firstYear?.min || 0)}</strong></div>
          <div style={{ padding: "10px 22px", borderRadius: 8, background: R.accent, color: "#000", fontWeight: 800, fontSize: 13 }}>
            Ver informe completo
          </div>
        </div>
      </div>
    );
  }

  if (id === "crecimiento-rapido") {
    const wins = (analysis?.opportunities?.length ? analysis.opportunities.slice(0, isStory ? 2 : 3) : displayServices.slice(0, isStory ? 2 : 3));
    const isOppObj = wins.length > 0 && wins[0] && typeof wins[0] === "object" && !wins[0].service;
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column" }}>
        <Glow color={R.accent} top={-60} left={-60} size={340} />
        <div style={{ padding: isStory ? "52px 56px 28px" : "36px 56px 20px", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", color: R.accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
              Quick Wins detectados
            </div>
            <div style={{ fontSize: isStory ? 44 : 34, fontWeight: 900, color: R.text, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              {isStory ? 2 : 3} oportunidades para <span style={{ color: R.accent }}>{prospect.name}</span>
            </div>
          </div>
          <Brand size="md" />
        </div>
        <div style={{ flex: 1, padding: "0 56px", display: "flex", flexDirection: isLandscape ? "row" : "column", gap: 16 }}>
          {wins.map((item, i) => {
            const isService = !isOppObj;
            const name = isService ? item.service : (item.title || item.name || "Oportunidad");
            const icon = isService ? (item.icon || "🚀") : "🚀";
            const price = isService ? formatServicePricing(item) : null;
            const barW = Math.max(40, 100 - i * 20);
            return (
              <div key={name} style={{ flex: 1, padding: "20px", background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.14)", borderRadius: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 28, lineHeight: 1 }}>{icon}</span>
                  <div style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(0,255,136,0.15)", color: R.accent, fontSize: 10, fontWeight: 700 }}>Alta prioridad</div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: R.text, marginBottom: 6 }}>{name}</div>
                  {price && <div style={{ fontSize: 20, fontWeight: 900, color: R.accent }}>{price}</div>}
                </div>
                {/* Impact bar */}
                <div>
                  <div style={{ fontSize: 10, color: R.muted, marginBottom: 4 }}>Impacto estimado</div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${barW}%`, borderRadius: 2, background: `linear-gradient(90deg, ${R.accent}, rgba(0,255,136,0.4))` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: isStory ? "20px 56px 36px" : "14px 56px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 16 }}>
          <Brand />
          <div style={{ fontSize: 14, color: R.muted }}>Podemos empezar esta semana</div>
        </div>
      </div>
    );
  }

  if (id === "propuesta-inicial") {
    const items = displayServices.slice(0, isStory ? 3 : 5);
    const totalFirstYear = displayPricingSummary.firstYear?.min || 0;
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column" }}>
        <Glow color={R.accent} top={-80} right={-80} size={380} />
        {/* Header */}
        <div style={{ padding: isStory ? "48px 56px 24px" : "32px 56px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <div style={{ fontSize: 11, color: R.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Propuesta inicial para</div>
            <div style={{ fontSize: isStory ? 38 : 28, fontWeight: 900, color: R.accent, letterSpacing: "-0.03em" }}>{prospect.name}</div>
          </div>
          <Brand size="md" />
        </div>
        {/* Services list */}
        <div style={{ flex: 1, padding: isStory ? "24px 56px" : "18px 56px", display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(s => (
            <div key={s.service} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10 }}>
              <span style={{ fontSize: 20 }}>{s.icon || "🔧"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: R.text }}>{s.service}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: R.accent }}>{formatServicePricing(s)}</div>
            </div>
          ))}
        </div>
        {/* Total + CTA */}
        <div style={{ padding: isStory ? "20px 56px 36px" : "14px 56px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: R.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Total estimado primer año</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: R.text, letterSpacing: "-0.03em" }}>{formatCurrency(totalFirstYear)}</div>
          </div>
          <div style={{ padding: "12px 28px", borderRadius: 10, background: R.accent, color: "#000", fontWeight: 800, fontSize: 14 }}>
            Agenda una llamada →
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function ProspectingTab({ prospect, proposals = [], format }) {
  const [templateId, setTemplateId] = useState("diagnostico-digital");
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
