import { Button, Card, EmptyState, ScoreRing, Tag } from "../components/Primitives";
import { opportunityConfig, theme } from "../app/theme";
import { formatCurrency } from "../utils/format";

function printAnalysis() {
  const styleId = "prospect-print-style";
  document.getElementById(styleId)?.remove();
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    @media print {
      body > * { display: none !important; }
      #analysis-print-target { display: block !important; position: fixed; inset: 0; padding: 24px; background: #ffffff !important; font-family: 'DM Sans', system-ui, sans-serif; overflow: visible !important; }
      #analysis-print-target * { color: #111111 !important; background: transparent !important; border-color: #cccccc !important; box-shadow: none !important; }
      .no-print { display: none !important; }
    }
  `;
  document.head.appendChild(style);
  window.print();
  setTimeout(() => style.remove(), 2000);
}

export function AnalysisScreen({ prospect, onGenerateAnalysis, onRegenerateAnalysis, onGenerateKit, onOpenAssets }) {
  if (!prospect) {
    return <EmptyState title="Selecciona un prospecto" description="Necesitas abrir un prospecto para revisar o generar análisis." />;
  }

  const analysis = prospect.analysis;
  const tagColors = { "Quick Win": theme.accent, Revenue: theme.yellow, Proyecto: theme.blue, Retención: theme.purple };
  const priorityColors = { urgente: theme.red, alta: theme.yellow, media: theme.blue };

  if (!analysis) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div
          style={{
            height: 58,
            borderBottom: `1px solid ${theme.border}`,
            display: "flex",
            alignItems: "center",
            padding: "0 28px",
            background: theme.bg
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: theme.dim, marginBottom: 2, letterSpacing: "0.04em" }}>{prospect.name}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Análisis</div>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <EmptyState
            title="Sin análisis disponible"
            description="Este prospecto todavía no tiene análisis heurístico persistido. Generarlo guardará oportunidades, revenue estimado y plan de acción."
            actions={
              <Button variant="primary" size="lg" onClick={onGenerateAnalysis}>
                Generar análisis
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div
        className="no-print"
        style={{
          height: 58,
          borderBottom: `1px solid ${theme.border}`,
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          gap: 16,
          background: theme.bg
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.dim, marginBottom: 2, letterSpacing: "0.04em" }}>{prospect.name}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Análisis heurístico</div>
        </div>
        <Button variant="ghost" size="sm" onClick={onRegenerateAnalysis} className="no-print">
          Regenerar
        </Button>
        <Button variant="ghost" size="sm" onClick={printAnalysis} className="no-print">
          PDF
        </Button>
        <Button variant="secondary" size="sm" onClick={onOpenAssets} className="no-print">
          Crear assets
        </Button>
        <Button variant="primary" size="sm" onClick={onGenerateKit} className="no-print">
          Generar kit
        </Button>
      </div>

      <div id="analysis-print-target" style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 14 }}>
          <Card style={{ padding: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, textAlign: "center" }}>
            <ScoreRing value={analysis.opportunityScore} size={90} />
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.accent }}>{analysis.scoreLabel}</div>
            <div style={{ fontSize: 10, color: theme.muted }}>Score de oportunidad</div>
          </Card>

          <Card style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 16 }}>
              Desglose del score
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {analysis.scoreBreakdown.map((item) => {
                const color = item.value >= 70 ? theme.red : item.value >= 40 ? theme.yellow : theme.accent;
                return (
                  <div key={item.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: theme.muted }}>{item.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, color: theme.dim }}>{item.note}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color, width: 28, textAlign: "right" }}>{item.value}</span>
                      </div>
                    </div>
                    <div style={{ height: 4, background: theme.border, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${item.value}%`, background: color, borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 12 }}>Características faltantes</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {analysis.missingFeatures.map((feature) => (
              <div
                key={feature.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 14px",
                  borderRadius: 20,
                  background: feature.critical ? theme.redBg : "rgba(255,255,255,0.04)",
                  border: `1px solid ${feature.critical ? "rgba(255,68,85,0.25)" : theme.border}`
                }}
              >
                <span style={{ color: feature.critical ? theme.red : theme.muted, fontWeight: 700, fontSize: 12 }}>×</span>
                <span style={{ fontSize: 12, color: feature.critical ? theme.red : theme.muted, fontWeight: feature.critical ? 600 : 400 }}>
                  {feature.name}
                </span>
                {feature.critical ? <span style={{ fontSize: 9, color: theme.red, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>urgente</span> : null}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 12 }}>Qué conviene vender</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {analysis.recommendedServices.map((service, index) => (
              <div
                key={service.service}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 20px",
                  background: theme.s2,
                  border: `1px solid ${index === 0 ? theme.accentBorder : theme.border}`,
                  borderRadius: 10,
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {index === 0 ? <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: theme.accent }} /> : null}
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {service.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 3 }}>{service.service}</div>
                  <div style={{ fontSize: 12, color: theme.muted }}>{service.desc}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 10, color: theme.dim, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Confianza</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: service.confidence >= 90 ? theme.accent : theme.yellow }}>{service.confidence}%</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: theme.accent }}>{formatCurrency(service.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Card style={{ padding: 20, background: `linear-gradient(135deg, ${theme.s2} 0%, rgba(0,255,136,0.04) 100%)`, border: `1px solid ${theme.accentBorder}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.accent, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>
              Potencial de ingresos
            </div>
            <div style={{ fontSize: 13, color: theme.muted, marginBottom: 6 }}>Este prospecto representa entre</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: theme.text, letterSpacing: "-0.02em" }}>
              {formatCurrency(analysis.revenue.min)} - {formatCurrency(analysis.revenue.max)}
              <span style={{ fontSize: 14, fontWeight: 400, color: theme.muted }}> / mes</span>
            </div>
          </Card>

          <Card style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12 }}>
              Debilidades detectadas
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {analysis.weaknesses.map((weakness) => (
                <span key={weakness} style={{ padding: "4px 10px", borderRadius: 20, background: theme.redBg, border: "1px solid rgba(255,68,85,0.2)", color: theme.red, fontSize: 11, fontWeight: 500 }}>
                  {weakness}
                </span>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 12 }}>Oportunidades detectadas</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10 }}>
            {analysis.opportunities.map((opportunity) => {
              const config = opportunityConfig[opportunity.type] || { icon: "◎", color: theme.blue };
              return (
                <Card key={opportunity.title} style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 7, background: `${config.color}14`, display: "flex", alignItems: "center", justifyContent: "center", color: config.color, fontSize: 14 }}>
                        {config.icon}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{opportunity.title}</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", padding: "2px 7px", borderRadius: 20, background: `${priorityColors[opportunity.priority]}18`, color: priorityColors[opportunity.priority] }}>
                      {opportunity.priority}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.6, marginBottom: 10 }}>{opportunity.desc}</div>
                  <div style={{ height: 3, background: theme.border, borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${opportunity.impact}%`, background: config.color, borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 10, color: theme.dim, marginTop: 4 }}>Impacto estimado: {opportunity.impact}%</div>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 12 }}>Plan de acción</div>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            {analysis.actionPlan.map((row, index) => (
              <div key={row.action} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: index < analysis.actionPlan.length - 1 ? `1px solid ${theme.border}` : "none" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: theme.s3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: theme.muted, flexShrink: 0 }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: theme.text }}>{row.action}</div>
                <Tag color={tagColors[row.tag]}>{row.tag}</Tag>
                <div style={{ textAlign: "right", minWidth: 70 }}>
                  <div style={{ fontSize: 10, color: theme.dim }}>Impacto</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: theme.accent }}>{row.impact}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
