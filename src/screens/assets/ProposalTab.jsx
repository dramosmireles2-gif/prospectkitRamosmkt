import { useState } from "react";
import { theme } from "../../app/theme";
import { formatCurrency } from "../../utils/format";
import { formatServicePricing } from "../../services/serviceCatalog";
import { getActiveProposal, getProspectCommercialSnapshot } from "../../services/proposals";
import { Button } from "../../components/Primitives";
import { useAssetExport } from "./useAssetExport";
import { R, BASE, Brand } from "./shared";

const TEMPLATES = [
  { id: "propuesta-visual", label: "Propuesta Visual",         desc: "Resumen visual de la propuesta" },
  { id: "roadmap",          label: "Roadmap",                  desc: "Timeline de implementación 4 fases" },
  { id: "timeline",         label: "Timeline",                 desc: "Cronograma semanal detallado" },
  { id: "alcance",          label: "Alcance del Servicio",     desc: "Scope of work por servicio" },
  { id: "comparativa",      label: "Actual vs Futuro",         desc: "Transformación digital visual" },
];

function ProposalTemplate({ id, prospect, format, pricingSnapshot }) {
  const isStory = format?.id === "story";
  const isLandscape = format?.id === "landscape";
  const services = pricingSnapshot?.services || [];
  const summary = pricingSnapshot?.pricingSummary || { oneTime: { min: 0 }, monthly: { min: 0 }, firstYear: { min: 0 } };

  if (id === "propuesta-visual") {
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isStory ? "36px 48px 20px" : "24px 48px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 11, color: R.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Propuesta para</div>
            <div style={{ fontSize: isStory ? 36 : 26, fontWeight: 900, color: R.text, letterSpacing: "-0.02em" }}>{prospect?.name || "Tu negocio"}</div>
          </div>
          <Brand />
        </div>
        <div style={{ flex: 1, padding: isStory ? "24px 48px" : "20px 48px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            {services.slice(0, isStory ? 4 : 6).map(s => {
              const type = s.billingType || "monthly";
              const typeLabel = type === "one_time" ? "Pago único" : type === "setup_monthly" ? "Setup + mensual" : "Mensual";
              const typeColor = type === "one_time" ? R.blue : type === "setup_monthly" ? R.yellow : R.accent;
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

  if (id === "roadmap") {
    const phases = [
      { week: "Semana 1-2", title: "Setup y configuración", color: R.blue, bullets: ["Onboarding y accesos", "Configuración de cuentas", "Revisión de materiales"] },
      { week: "Semana 3-4", title: "Lanzamiento", color: R.accent, bullets: ["Publicación inicial", "Activación de campañas", "Pruebas de funcionalidad"] },
      { week: "Mes 2", title: "Optimización", color: R.yellow, bullets: ["Análisis de primeros datos", "Ajuste de estrategia", "Mejora de conversiones"] },
      { week: "Mes 3+", title: "Crecimiento", color: R.purple, bullets: ["Escalado de resultados", "Nuevas oportunidades", "Reporte de impacto"] }
    ];
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isStory ? "40px 48px 20px" : "24px 48px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 11, color: R.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Roadmap de implementación</div>
            <div style={{ fontSize: isStory ? 36 : 26, fontWeight: 900, color: R.text, letterSpacing: "-0.02em" }}>{prospect?.name || "Tu negocio"}</div>
          </div>
          <Brand />
        </div>
        <div style={{ flex: 1, padding: isStory ? "28px 48px" : "20px 48px", display: "flex", flexDirection: isLandscape ? "row" : "column", gap: 16, alignItems: "stretch" }}>
          {phases.map(phase => (
            <div key={phase.title} style={{ flex: 1, padding: "18px", background: "rgba(255,255,255,0.03)", border: `1px solid ${phase.color}22`, borderRadius: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: phase.color, flexShrink: 0 }} />
                <div style={{ fontSize: 10, color: R.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{phase.week}</div>
              </div>
              <div style={{ fontSize: isLandscape ? 14 : 15, fontWeight: 800, color: R.text, lineHeight: 1.3 }}>{phase.title}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {phase.bullets.map(b => (
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

  if (id === "timeline") {
    const weeks = [
      { n: 1,   label: "Kickoff + Discovery",     color: R.blue,   bullets: ["Onboarding", "Accesos", "Brief completo"] },
      { n: 2,   label: "Diseño + Wireframes",      color: R.purple, bullets: ["Maquetas", "Paleta final", "Revisión cliente"] },
      { n: "3-4", label: "Desarrollo",             color: R.accent, bullets: ["Frontend", "Backend", "Integraciones"] },
      { n: 5,   label: "QA + Revisiones",          color: R.yellow, bullets: ["Testing", "Ajustes", "Aprobación"] },
      { n: 6,   label: "Lanzamiento",              color: R.red,    bullets: ["Deploy", "DNS", "Entrega"] },
    ];
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isStory ? "40px 48px 20px" : "24px 48px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 11, color: R.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Cronograma detallado</div>
            <div style={{ fontSize: isStory ? 36 : 26, fontWeight: 900, color: R.text, letterSpacing: "-0.02em" }}>{prospect?.name || "Tu proyecto"}</div>
          </div>
          <Brand />
        </div>
        <div style={{ flex: 1, padding: isStory ? "24px 48px" : "16px 48px", display: "flex", flexDirection: isLandscape ? "row" : "column", gap: 12 }}>
          {weeks.map(w => (
            <div key={w.n} style={{ flex: 1, padding: "16px", background: "rgba(255,255,255,0.03)", border: `1px solid ${w.color}22`, borderRadius: 12 }}>
              <div style={{ fontSize: 10, color: w.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Semana {w.n}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: R.text, lineHeight: 1.3, marginBottom: 8 }}>{w.label}</div>
              {w.bullets.map(b => (
                <div key={b} style={{ display: "flex", gap: 5, alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ color: w.color, fontSize: 9, marginTop: 3, flexShrink: 0 }}>●</span>
                  <span style={{ fontSize: 10, color: R.muted, lineHeight: 1.4 }}>{b}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding: isStory ? "16px 48px 32px" : "12px 48px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize: 13, color: R.muted }}>Entrega garantizada en 6 semanas</div>
          <Brand size="sm" />
        </div>
      </div>
    );
  }

  if (id === "alcance") {
    const serviceDeliverables = {
      "Web": ["Landing page responsive", "Formulario de contacto", "Optimización básica SEO"],
      "SEO": ["Auditoría de palabras clave", "Optimización on-page", "Reporte mensual"],
      "Redes Sociales": ["Calendario de contenido", "Diseño de publicaciones", "Gestión de comunidad"],
      "Google Ads": ["Configuración de campañas", "Segmentación de audiencias", "Optimización mensual"],
      "Email Marketing": ["Secuencia de bienvenida", "Newsletters mensuales", "Automatizaciones básicas"]
    };
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isStory ? "36px 48px 20px" : "22px 48px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 11, color: R.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Alcance del servicio</div>
            <div style={{ fontSize: isStory ? 34 : 24, fontWeight: 900, color: R.text, letterSpacing: "-0.02em" }}>{prospect?.name || "Tu negocio"}</div>
          </div>
          <Brand />
        </div>
        <div style={{ flex: 1, padding: isStory ? "20px 48px" : "16px 48px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "grid", gridTemplateColumns: isStory ? "1fr" : services.length >= 4 ? "repeat(2,1fr)" : "1fr 1fr", gap: 12, flex: 1 }}>
            {services.slice(0, isStory ? 3 : 4).map(s => {
              const key = Object.keys(serviceDeliverables).find(k => s.service?.toLowerCase().includes(k.toLowerCase())) || "Web";
              const deliverables = serviceDeliverables[key] || ["Entrega puntual", "Reporte de avance", "Soporte incluido"];
              return (
                <div key={s.service} style={{ padding: "16px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 22 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: R.text }}>{s.service}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: R.accent }}>{formatServicePricing(s)}</div>
                    </div>
                  </div>
                  {deliverables.map(d => (
                    <div key={d} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
                      <span style={{ color: R.accent, fontSize: 10, marginTop: 3 }}>●</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{d}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: R.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Setup</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: R.text }}>{formatCurrency(summary.oneTime?.min || 0)}</div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: R.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>Mensual</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: R.accent }}>{formatCurrency(summary.monthly?.min || 0)}</div>
            </div>
          </div>
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
      <div style={{ ...BASE, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isStory ? "40px 48px 20px" : "24px 52px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 11, color: R.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Actual vs Con RamosMKT</div>
            <div style={{ fontSize: isStory ? 36 : 26, fontWeight: 900, color: R.text, letterSpacing: "-0.02em" }}>{prospect?.name || "Tu negocio"}</div>
          </div>
          <Brand />
        </div>
        <div style={{ flex: 1, padding: isStory ? "24px 48px" : "16px 52px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 0, marginBottom: 8 }}>
            <div />
            <div style={{ width: isStory ? 110 : 130, textAlign: "center", fontSize: 11, color: "#ff6677", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 8px" }}>Actual</div>
            <div style={{ width: isStory ? 130 : 150, textAlign: "center", fontSize: 11, color: R.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 8px" }}>Con RamosMKT</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
            {rows.slice(0, isStory ? 5 : 6).map(row => (
              <div key={row.label} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{row.label}</div>
                <div style={{ width: isStory ? 110 : 130, textAlign: "center", fontSize: 18, color: R.red }}>✗</div>
                <div style={{ width: isStory ? 130 : 150, textAlign: "center", fontSize: 18, color: R.accent }}>✓</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: "14px 18px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: R.text }}>¿Empezamos hoy?</div>
            <div style={{ padding: "8px 20px", borderRadius: 8, background: R.accent, color: "#000", fontSize: 13, fontWeight: 800 }}>Hablemos →</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function ProposalTab({ prospect, proposals = [], format }) {
  const [templateId, setTemplateId] = useState("propuesta-visual");
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
