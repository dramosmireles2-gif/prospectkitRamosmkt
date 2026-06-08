import { useState } from "react";
import { theme } from "../../app/theme";
import { formatCurrency } from "../../utils/format";
import { formatServicePricing } from "../../services/serviceCatalog";
import { getActiveProposal, getProspectCommercialSnapshot } from "../../services/proposals";
import { Button } from "../../components/Primitives";
import { useAssetExport } from "./useAssetExport";
import { R, BASE, Brand } from "./shared";

const TEMPLATES = [
  { id: "propuesta-completa",  label: "Propuesta Completa",   desc: "Servicios, precios negociados y totales del año" },
  { id: "roadmap-visual",      label: "Roadmap Visual",        desc: "4 fases de implementación con hitos clave" },
  { id: "comparativa-digital", label: "Actual vs RamosGrowth",   desc: "Transformación digital: situación actual vs futuro" },
];

function ProposalTemplate({ id, prospect, format, pricingSnapshot }) {
  const isStory = format?.id === "story";
  const isLandscape = format?.id === "landscape";
  const services = pricingSnapshot?.services || [];
  const summary = pricingSnapshot?.pricingSummary || { oneTime: { min: 0 }, monthly: { min: 0 }, firstYear: { min: 0 } };
  const hasProposal = pricingSnapshot?.source === "proposal";
  const sourceBadge = hasProposal
    ? { label: "Con propuesta activa", bg: "rgba(0,255,136,0.12)", border: "rgba(0,255,136,0.3)", color: R.accent }
    : { label: "Basado en análisis",   bg: "rgba(120,120,120,0.12)", border: "rgba(120,120,120,0.25)", color: R.muted };

  if (id === "propuesta-completa") {
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isStory ? "36px 48px 20px" : "24px 48px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 11, color: R.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Propuesta para</div>
            <div style={{ fontSize: isStory ? 36 : 26, fontWeight: 900, color: R.text, letterSpacing: "-0.02em" }}>{prospect?.name || "Tu negocio"}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <Brand />
            <div style={{ padding: "3px 10px", borderRadius: 20, background: sourceBadge.bg, border: `1px solid ${sourceBadge.border}`, color: sourceBadge.color, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
              {sourceBadge.label}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, padding: isStory ? "20px 48px" : "16px 48px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            {services.slice(0, isStory ? 4 : 6).map(s => {
              const billingType = s.billingType || s.type || "mensual";
              const typeLabel = billingType === "unico" ? "Pago único" : billingType === "anual" ? "Anual" : billingType === "setup+mensual" ? "Setup + mensual" : "Mensual";
              const typeColor = billingType === "unico" ? R.blue : billingType === "anual" ? R.purple : billingType === "setup+mensual" ? R.yellow : R.accent;
              return (
                <div key={s.service} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: R.text }}>{s.service}</div>
                  </div>
                  <div style={{ padding: "3px 10px", borderRadius: 20, background: `${typeColor}18`, border: `1px solid ${typeColor}44`, color: typeColor, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>{typeLabel}</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: R.accent, minWidth: 80, textAlign: "right" }}>{formatServicePricing(s)}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16, padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ flex: 1, textAlign: "center", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: R.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Pago inicial</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: R.text }}>{formatCurrency(summary.oneTime?.min || 0)}</div>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "12px", background: "rgba(0,255,136,0.05)", borderRadius: 10, border: "1px solid rgba(0,255,136,0.15)" }}>
              <div style={{ fontSize: 10, color: R.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Mensual recurrente</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: R.accent }}>{formatCurrency(summary.monthly?.min || 0)}</div>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: R.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Anual proyectado</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: R.text }}>{formatCurrency(summary.firstYear?.min || 0)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (id === "roadmap-visual") {
    const phases = [
      { week: "Semana 1-2", title: "Setup",        icon: "⚙️", color: R.blue,   bullets: ["Onboarding y accesos", "Configuración inicial"] },
      { week: "Semana 3-4", title: "Lanzamiento",  icon: "🚀", color: R.accent, bullets: ["Publicación y activación", "Pruebas de funcionalidad"] },
      { week: "Mes 2-3",    title: "Optimización", icon: "📈", color: R.yellow, bullets: ["Análisis de primeros datos", "Ajuste de estrategia"] },
      { week: "Mes 4+",     title: "Escala",        icon: "⚡", color: R.purple, bullets: ["Escalado de resultados", "Nuevas oportunidades"] }
    ];
    const visiblePhases = isStory ? phases.slice(0, 3) : phases;
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isStory ? "40px 48px 20px" : "24px 48px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 11, color: R.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Roadmap de implementación</div>
            <div style={{ fontSize: isStory ? 36 : 26, fontWeight: 900, color: R.text, letterSpacing: "-0.02em" }}>{prospect?.name || "Tu negocio"}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <Brand />
            <div style={{ padding: "3px 10px", borderRadius: 20, background: sourceBadge.bg, border: `1px solid ${sourceBadge.border}`, color: sourceBadge.color, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
              {sourceBadge.label}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, padding: isStory ? "28px 48px" : "20px 48px", display: "flex", flexDirection: isLandscape ? "row" : "column", gap: 16, alignItems: "stretch" }}>
          {visiblePhases.map(phase => (
            <div key={phase.title} style={{ flex: 1, padding: "18px", background: "rgba(255,255,255,0.03)", border: `1px solid ${phase.color}22`, borderRadius: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{phase.icon}</span>
                <div>
                  <div style={{ fontSize: 10, color: phase.color, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{phase.week}</div>
                  <div style={{ fontSize: isLandscape ? 14 : 15, fontWeight: 800, color: R.text, lineHeight: 1.3 }}>{phase.title}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {phase.bullets.map(b => (
                  <div key={b} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: phase.color, fontSize: 10, marginTop: 3, flexShrink: 0 }}>●</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (id === "comparativa-digital") {
    const leftRows = [
      "Sin presencia digital profesional",
      "Sin publicidad online activa",
      "Sin seguimiento de métricas",
      "Clientes perdidos a competidores",
      "Sin automatización de clientes",
    ];
    const rightRows = [
      "Presencia digital optimizada",
      "Campañas activas y medibles",
      "Reportes y análisis continuos",
      "Captación constante de clientes",
      "Automatización y seguimiento",
    ];
    const visibleCount = isStory ? 4 : 5;
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isStory ? "40px 48px 20px" : "24px 52px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 11, color: R.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Actual vs Con RamosGrowth</div>
            <div style={{ fontSize: isStory ? 36 : 26, fontWeight: 900, color: R.text, letterSpacing: "-0.02em" }}>{prospect?.name || "Tu negocio"}</div>
          </div>
          <Brand />
        </div>
        <div style={{ flex: 1, padding: isStory ? "20px 48px" : "14px 52px", display: "flex", flexDirection: isLandscape ? "row" : "column", gap: 16 }}>
          {/* Left: Actual */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12, color: R.red, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Situación actual</div>
            {leftRows.slice(0, visibleCount).map(row => (
              <div key={row} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 14px", background: "rgba(255,68,85,0.06)", border: "1px solid rgba(255,68,85,0.18)", borderRadius: 9 }}>
                <span style={{ color: R.red, fontWeight: 900, fontSize: 14, flexShrink: 0 }}>✗</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>{row}</span>
              </div>
            ))}
          </div>
          {/* Right: Con RamosGrowth */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12, color: R.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Con RamosGrowth</div>
            {rightRows.slice(0, visibleCount).map(row => (
              <div key={row} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 14px", background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 9 }}>
                <span style={{ color: R.accent, fontWeight: 900, fontSize: 14, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>{row}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: isStory ? "16px 48px 32px" : "12px 52px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: R.muted }}>Transforma tu negocio digital</div>
          <Brand size="sm" />
        </div>
      </div>
    );
  }

  return null;
}

export function ProposalTab({ prospect, proposals = [], format }) {
  const [templateId, setTemplateId] = useState("propuesta-completa");
  const [previewOpen, setPreviewOpen] = useState(false);
  const activeProposal = getActiveProposal(proposals);
  const pricingSnapshot = prospect ? getProspectCommercialSnapshot(prospect, activeProposal) : null;

  const slugName = prospect?.name?.toLowerCase().replace(/\s+/g, "-") || "rmkt";
  const { exportRef, downloading, message, download } = useAssetExport({
    filename: `rmkt-proposal-${templateId}-${slugName}-${format?.id || "landscape"}`
  });

  const currentTemplate = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
  const previewScale = Math.min(600 / (format?.w || 1200), 340 / (format?.h || 630));
  const previewW = (format?.w || 1200) * previewScale;
  const previewH = (format?.h || 630) * previewScale;

  function renderTemplate(id) {
    return <ProposalTemplate id={id} prospect={prospect} format={format} pricingSnapshot={pricingSnapshot} />;
  }

  return (
    <div style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* No proposal warning banner */}
      {prospect && !activeProposal && (
        <div style={{ padding: "10px 28px", background: "rgba(255,187,68,0.07)", borderBottom: "1px solid rgba(255,187,68,0.18)", flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: R.yellow }}>Sin propuesta activa — se muestran datos del análisis como fallback.</span>
        </div>
      )}
      {!prospect && (
        <div style={{ padding: "10px 28px", background: "rgba(255,187,68,0.07)", borderBottom: "1px solid rgba(255,187,68,0.18)", flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: R.yellow }}>Selecciona un prospecto para personalizar los assets de propuesta.</span>
        </div>
      )}

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "220px 1fr", overflow: "hidden" }}>
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
