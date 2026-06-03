import { useRef, useState } from "react";
import { Button, Card, EmptyState } from "../components/Primitives";
import { theme } from "../app/theme";
import { formatCurrency } from "../utils/format";
import { useIsMobile } from "../hooks/useIsMobile";
import { formatServicePricing } from "../services/serviceCatalog";

const templates = [
  { id: "score-card",     label: "Score Card",          desc: "Oportunidad detectada · Landscape" },
  { id: "audit-card",     label: "Audit Card",          desc: "Gaps digitales · Visual" },
  { id: "before-after",   label: "Before / After",      desc: "Propuesta comparativa" },
  { id: "prospecting",    label: "Imagen de prospección", desc: "Primer contacto · Impact" },
  { id: "audit-summary",  label: "Resumen de auditoría", desc: "Documento profesional" }
];

const FORMATS = [
  { id: "landscape", label: "Landscape", w: 1200, h: 630 },
  { id: "square",    label: "Square",    w: 1080, h: 1080 },
  { id: "story",     label: "Story",     w: 1080, h: 1920 }
];

const accent = "#00ff88";
const baseStyle = {
  width: "100%",
  height: "100%",
  background: "#0a0a0a",
  color: "#f0f0f0",
  fontFamily: "'DM Sans', system-ui, sans-serif",
  overflow: "hidden",
  position: "relative"
};

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 22, height: 22, borderRadius: 5, background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, color: "#000" }}>
        R
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#f0f0f0", lineHeight: 1.1 }}>RamosMKT</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", lineHeight: 1 }}>ProspectKit</div>
      </div>
    </div>
  );
}

function AssetTemplate({ id, prospect, format }) {
  const analysis = prospect.analysis;
  const score = prospect.opportunityScore;
  const color = score >= 85 ? accent : score >= 70 ? "#ffbb44" : "#4a9eff";
  const isStory = format?.id === "story";
  const colDir = isStory ? "column" : "row";

  if (id === "score-card") {
    return (
      <div style={baseStyle}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,136,0.07) 0%, transparent 60%)" }} />
        <div style={{ display: "flex", flexDirection: colDir, height: "100%" }}>
          <div style={{ flex: isStory ? "0 0 55%" : undefined, width: isStory ? "100%" : "58%", padding: isStory ? "56px 56px 36px" : "48px 56px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 20, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", color: accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 28 }}>
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
            {(analysis?.recommendedServices || []).slice(0, isStory ? 3 : 4).map((service) => (
              <div key={service.service} style={{ padding: "13px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <span style={{ fontSize: 18 }}>{service.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>{service.service}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{service.confidence}% confianza</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color }}>{formatServicePricing(service)}</span>
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
            <div style={{ fontSize: 11, color: accent, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Auditoría digital gratuita</div>
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
            <div style={{ fontSize: 12, color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 22 }}>Con RamosMKT</div>
            {after.slice(0, isStory ? 3 : 5).map((item) => (
              <div key={item} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
                <span style={{ color: accent, fontWeight: 700, fontSize: 16, flexShrink: 0, lineHeight: 1.3 }}>✓</span>
                <span style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (id === "prospecting") {
    return (
      <div style={baseStyle}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 50%, rgba(0,255,136,0.07) 0%, transparent 55%)" }} />
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "72px 60px" : "52px 60px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 20 }}>Detectamos una oportunidad en</div>
            <div style={{ fontSize: isStory ? 64 : 50, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 12 }}>{prospect.name}</div>
            <div style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", marginBottom: 40 }}>{prospect.industry} · {prospect.city}</div>
            <div style={{ display: "flex", gap: 28, marginBottom: 36, flexDirection: isStory ? "column" : "row", alignItems: isStory ? "flex-start" : "center" }}>
              <div>
                <div style={{ fontSize: isStory ? 96 : 68, fontWeight: 900, color, letterSpacing: "-0.05em", lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.09em" }}>Score de oportunidad</div>
              </div>
              {!isStory && <div style={{ width: 1, height: 60, background: "rgba(255,255,255,0.1)" }} />}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(analysis?.recommendedServices || []).slice(0, 3).map((service) => (
                  <div key={service.service} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16 }}>{service.icon}</span>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{service.service}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color, marginLeft: 4 }}>{formatServicePricing(service)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ padding: "12px 24px", borderRadius: 8, background: accent, color: "#000", fontSize: 14, fontWeight: 800, letterSpacing: "0.02em" }}>Análisis gratuito disponible</div>
            <Brand />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...baseStyle, background: "#0d0d0d" }}>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "22px 48px", background: "rgba(0,255,136,0.06)", borderBottom: "1px solid rgba(0,255,136,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Resumen de auditoría digital</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#f0f0f0", letterSpacing: "-0.02em" }}>{prospect.name}</div>
          </div>
          <Brand />
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: isStory ? "1fr" : "1fr 1fr", padding: "28px 48px", gap: 32, overflowY: isStory ? "hidden" : undefined }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 22 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 52, fontWeight: 900, color, letterSpacing: "-0.04em", lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Oportunidad</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{prospect.industry} · {prospect.city}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>{prospect.notes || "Prospecto analizado con heurística y listo para trabajar comercialmente."}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12, fontWeight: 700 }}>Score por categoría</div>
            {(analysis?.scoreBreakdown || []).map((item) => (
              <div key={item.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{item.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: item.value < 40 ? accent : item.value < 70 ? "#ffbb44" : "rgba(255,255,255,0.4)" }}>{item.value}</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${item.value}%`, borderRadius: 2, background: item.value < 40 ? accent : item.value < 70 ? "#ffbb44" : "rgba(255,255,255,0.25)" }} />
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12, fontWeight: 700 }}>Recomendaciones</div>
            {(analysis?.recommendedServices || []).map((service) => (
              <div key={service.service} style={{ display: "flex", gap: 10, marginBottom: 12, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", alignItems: "center" }}>
                <span style={{ fontSize: 16 }}>{service.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{service.service}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{service.confidence}% confianza</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color }}>{formatServicePricing(service)}</div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: "14px 18px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: accent, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 6 }}>Potencial comercial</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#f0f0f0" }}>{formatCurrency(analysis?.pricingSummary?.oneTime?.min || 0)} inicial</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: accent, marginTop: 4 }}>{formatCurrency(analysis?.pricingSummary?.monthly?.min || 0)} mensual</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Valor 1er ano: {formatCurrency(analysis?.pricingSummary?.firstYear?.min || analysis?.revenue.min || 0)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AssetsScreen({ prospect }) {
  const isMobile = useIsMobile();
  const [templateId, setTemplateId] = useState("score-card");
  const [formatId, setFormatId] = useState("landscape");
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const exportRef = useRef(null);

  const fmt = FORMATS.find((f) => f.id === formatId) || FORMATS[0];

  if (!prospect) {
    return <EmptyState title="Selecciona un prospecto" description="Los assets se construyen con los datos persistidos del prospecto, su análisis y su kit." />;
  }

  const previewScale = Math.min(600 / fmt.w, 340 / fmt.h);
  const previewW = fmt.w * previewScale;
  const previewH = fmt.h * previewScale;

  async function download(fileFormat) {
    if (!exportRef.current || downloading) return;
    setDownloading(true);
    setMessage("Renderizando...");
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(exportRef.current, {
        scale: 1,
        backgroundColor: "#0a0a0a",
        useCORS: true,
        logging: false,
        width: fmt.w,
        height: fmt.h
      });
      const link = document.createElement("a");
      const slug = prospect.name.toLowerCase().replace(/\s+/g, "-");
      link.download = `${slug}-${templateId}-${formatId}.${fileFormat}`;
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

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div
        style={{
          minHeight: isMobile ? 84 : 58,
          borderBottom: `1px solid ${theme.border}`,
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          flexWrap: isMobile ? "wrap" : "nowrap",
          padding: isMobile ? "12px 16px" : "0 28px",
          gap: 16,
          background: theme.bg
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.dim, marginBottom: 2, letterSpacing: "0.04em" }}>{prospect.name}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Prospecting Assets</div>
        </div>
        {message ? <span style={{ fontSize: 12, color: theme.accent, fontWeight: 600 }}>{message}</span> : null}
        <Button variant="secondary" size="sm" onClick={() => download("png")} disabled={downloading}>PNG</Button>
        <Button variant="primary" size="sm" onClick={() => download("jpg")} disabled={downloading}>JPG</Button>
      </div>

      <div style={{ flex: 1, overflow: "hidden", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "220px 1fr" }}>
        {/* Sidebar */}
        <div style={{ borderRight: isMobile ? "none" : `1px solid ${theme.border}`, borderBottom: isMobile ? `1px solid ${theme.border}` : "none", padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 10, color: theme.dim, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 6, padding: "0 4px" }}>
            Plantillas
          </div>
          {templates.map((item) => (
            <div
              key={item.id}
              onClick={() => setTemplateId(item.id)}
              style={{
                padding: "11px 14px",
                borderRadius: 9,
                cursor: "pointer",
                background: templateId === item.id ? theme.accentBg : "transparent",
                border: `1px solid ${templateId === item.id ? theme.accentBorder : "transparent"}`
              }}
            >
              <div style={{ fontSize: 13, fontWeight: templateId === item.id ? 700 : 500, color: templateId === item.id ? theme.accent : theme.text, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontSize: 10, color: theme.muted, lineHeight: 1.4 }}>{item.desc}</div>
            </div>
          ))}

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
                  <AssetTemplate id={templateId} prospect={prospect} format={fmt} />
                </div>
              </div>
              <div style={{ position: "absolute", bottom: -28, left: 0, right: 0, textAlign: "center", fontSize: 10, color: theme.dim }}>
                Vista previa · exporta en {fmt.w}×{fmt.h} px
              </div>
            </div>
          </div>

          <div style={{ minHeight: isMobile ? 112 : 66, borderTop: `1px solid ${theme.border}`, display: "flex", alignItems: isMobile ? "flex-start" : "center", flexWrap: isMobile ? "wrap" : "nowrap", padding: isMobile ? "12px 16px" : "0 24px", gap: 12, background: theme.s1, flexShrink: 0 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{templates.find((item) => item.id === templateId)?.label} · {fmt.label}</div>
              <div style={{ fontSize: 11, color: theme.muted }}>{downloading ? "Generando imagen..." : `${prospect.name} · ${fmt.w}×${fmt.h} px`}</div>
            </div>
            <Button variant="ghost" size="md" onClick={() => setPreviewOpen(true)}>
              Ver en grande
            </Button>
            <Button variant="secondary" size="md" onClick={() => download("png")} disabled={downloading}>
              Descargar PNG
            </Button>
            <Button variant="primary" size="md" onClick={() => download("jpg")} disabled={downloading}>
              Descargar JPG
            </Button>
          </div>
        </div>
      </div>

      {/* Off-screen export canvas */}
      <div style={{ position: "fixed", left: -4000, top: 0, width: fmt.w, height: fmt.h, pointerEvents: "none" }}>
        <div ref={exportRef} style={{ width: fmt.w, height: fmt.h }}>
          <AssetTemplate id={templateId} prospect={prospect} format={fmt} />
        </div>
      </div>

      {/* Preview modal */}
      {previewOpen ? (
        <div
          onClick={() => setPreviewOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
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
                      <AssetTemplate id={templateId} prospect={prospect} format={fmt} />
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewOpen(false)}
                    style={{
                      position: "absolute", top: -14, right: -14,
                      width: 32, height: 32, borderRadius: "50%",
                      background: theme.s3, border: `1px solid ${theme.border}`,
                      color: theme.muted, fontSize: 16, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                  >
                    ×
                  </button>
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
