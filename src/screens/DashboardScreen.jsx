import { EmptyState, Button } from "../components/Primitives";
import { theme } from "../app/theme";
import { formatCompactCurrency } from "../utils/format";
import { PIPELINE_STAGES, NEXT_ACTION_TYPES } from "../app/constants";
import { useIsMobile } from "../hooks/useIsMobile";

function scoreColor(score) {
  if (score >= 85) return theme.accent;
  if (score >= 70) return theme.yellow;
  return theme.blue;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysDiff(dateStr) {
  const today = new Date(todayStr());
  const target = new Date(dateStr);
  return Math.floor((today - target) / 86400000);
}

export function DashboardScreen({ prospects, metrics, proposals = [], onOpenView, onSelectProspect, onSeedDemo, loading }) {
  const isMobile = useIsMobile();

  if (!prospects.length) {
    return (
      <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        <EmptyState
          title="Tu workspace todavia esta vacio"
          description="Crea tu primer prospecto o importa demo data para revisar el flujo completo con analisis, kit y assets."
          actions={
            <>
              <Button variant="primary" onClick={() => onOpenView("prospects")}>
                Crear prospecto
              </Button>
              <Button variant="secondary" onClick={onSeedDemo} disabled={loading}>
                {loading ? "Cargando demo..." : "Importar demo"}
              </Button>
            </>
          }
        />
      </div>
    );
  }

  const topPick = metrics.topProspect;
  const today = todayStr();

  // --- KPI calculations ---
  const mrr = proposals
    .filter((p) => p.status === "aceptada" || p.status === "negociacion")
    .reduce((sum, p) => sum + (p.totalNegotiated || 0), 0);

  const pipeline = proposals
    .filter((p) => p.status !== "rechazada" && !(p.status === "borrador" && !p.totalNegotiated))
    .reduce((sum, p) => sum + (p.totalNegotiated || 0), 0);

  const wonCount = prospects.filter((p) => p.pipelineStage === "ganado").length;
  const convRate = prospects.length > 0 ? Math.round((wonCount / prospects.length) * 100) : 0;

  const hotCount = prospects.filter((p) => p.leadTemperature === "urgente" || p.leadTemperature === "caliente").length;

  // --- Pipeline funnel ---
  const stageCounts = {};
  for (const p of prospects) {
    const stage = p.pipelineStage || "lead";
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  }
  const activeFunnelStages = PIPELINE_STAGES.filter((s) => stageCounts[s.id] > 0);

  // --- Overdue actions ---
  const overdueProspects = prospects
    .filter((p) => p.nextActionDate && p.nextActionDate <= today)
    .sort((a, b) => a.nextActionDate.localeCompare(b.nextActionDate))
    .slice(0, 5);

  const kpiCards = [
    {
      label: "Ingreso Recurrente Activo",
      sublabel: "MRR",
      value: formatCompactCurrency(mrr),
      color: theme.accent
    },
    {
      label: "Pipeline Total",
      sublabel: "Propuestas activas",
      value: formatCompactCurrency(pipeline),
      color: theme.blue
    },
    {
      label: "Tasa de Conversión",
      sublabel: "Prospectos ganados",
      value: `${convRate}%`,
      color: theme.yellow
    },
    {
      label: "Prospectos Calientes",
      sublabel: "Urgente o caliente",
      value: hotCount,
      color: theme.red
    }
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div
        style={{
          minHeight: isMobile ? 72 : 58,
          borderBottom: `1px solid ${theme.border}`,
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          flexWrap: isMobile ? "wrap" : "nowrap",
          padding: isMobile ? "12px 16px" : "0 28px",
          gap: 16,
          flexShrink: 0,
          background: theme.bg
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Intelligence Dashboard</div>
        </div>
        <Button variant="primary" size="sm" onClick={() => onOpenView("prospects")}>
          + Nuevo prospecto
        </Button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 16 : 24, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* === KPI ROW === */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 10 }}>
          {kpiCards.map((card) => (
            <div
              key={card.label}
              style={{
                background: theme.s2,
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                padding: "16px 18px",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -30,
                  right: -30,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${card.color}15 0%, transparent 65%)`
                }}
              />
              <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 2 }}>
                {card.sublabel}
              </div>
              <div style={{ fontSize: 11, color: theme.dim, marginBottom: 8 }}>{card.label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: card.color, letterSpacing: "-0.02em", lineHeight: 1 }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* === MINI PIPELINE FUNNEL === */}
        {activeFunnelStages.length > 0 && (
          <div
            style={{
              background: theme.s2,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              padding: "14px 18px",
              cursor: "pointer"
            }}
            onClick={() => onOpenView("pipeline")}
          >
            <div style={{ fontSize: 11, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 12 }}>
              Pipeline — click para abrir
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {activeFunnelStages.map((stage) => (
                <div
                  key={stage.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "6px 12px",
                    borderRadius: 20,
                    background: stage.bg || `${stage.color}18`,
                    border: `1px solid ${stage.color}40`,
                    flexShrink: 0
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: stage.color, display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: theme.text, fontWeight: 600 }}>{stage.label}</span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: stage.color,
                      minWidth: 18,
                      textAlign: "center"
                    }}
                  >
                    {stageCounts[stage.id]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === OVERDUE ACTIONS === */}
        {overdueProspects.length > 0 && (
          <div
            style={{
              background: theme.s2,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              padding: "14px 18px"
            }}
          >
            <div style={{ fontSize: 11, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 12 }}>
              Proximas acciones urgentes
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {overdueProspects.map((prospect) => {
                const days = daysDiff(prospect.nextActionDate);
                const actionType = NEXT_ACTION_TYPES.find((t) => t.id === prospect.nextActionType);
                return (
                  <div
                    key={prospect.id}
                    onClick={() => {
                      onSelectProspect(prospect);
                      onOpenView(prospect.analysis ? "analysis" : "detail");
                    }}
                    style={{
                      display: "flex",
                      alignItems: isMobile ? "flex-start" : "center",
                      flexWrap: isMobile ? "wrap" : "nowrap",
                      gap: 12,
                      padding: "9px 12px",
                      borderRadius: 8,
                      background: "rgba(255,68,85,0.05)",
                      border: `1px solid rgba(255,68,85,0.2)`,
                      cursor: "pointer"
                    }}
                  >
                    <span style={{ fontSize: 15, flexShrink: 0 }}>{actionType?.icon || "⚡"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {prospect.name}
                      </div>
                      <div style={{ fontSize: 11, color: theme.muted }}>{actionType?.label || prospect.nextActionType}</div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: isMobile ? "left" : "right" }}>
                      {days === 0 ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: theme.yellow }}>Hoy</span>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, color: theme.red }}>+{days}d</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* === EXISTING CONTENT === */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 300px", gap: 14 }}>
          <div
            style={{
              background: theme.s2,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              padding: 28,
              position: "relative",
              overflow: "hidden",
              cursor: "pointer"
            }}
            onClick={() => {
              onSelectProspect(topPick);
              onOpenView(topPick.analysis ? "analysis" : "detail");
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 280,
                height: 280,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 65%)"
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -80,
                left: -40,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(74,158,255,0.04) 0%, transparent 60%)"
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 14 : 0, marginBottom: 20 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: theme.accent, display: "inline-block" }} />
                    <span style={{ fontSize: 11, color: theme.accent, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Prospecto prioritario
                    </span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: theme.text, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 6 }}>
                    {topPick?.name}
                  </div>
                  <div style={{ fontSize: 13, color: theme.muted }}>
                    {topPick?.industry} - {topPick?.city}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div
                    style={{
                      fontSize: 54,
                      fontWeight: 900,
                      color: scoreColor(topPick?.opportunityScore || 0),
                      letterSpacing: "-0.04em",
                      lineHeight: 1
                    }}
                  >
                    {topPick?.opportunityScore || 0}
                  </div>
                  <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>
                    oportunidad
                  </div>
                </div>
              </div>

              {topPick?.analysis?.recommendedServices?.length ? (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: theme.dim, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 10 }}>
                    Que conviene vender primero
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {topPick.analysis.recommendedServices.slice(0, 3).map((service) => (
                      <div
                        key={service.service}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 12px",
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 8,
                          border: `1px solid ${theme.border}`
                        }}
                      >
                        <span style={{ fontSize: 15 }}>{service.icon}</span>
                        <span style={{ flex: 1, fontSize: 13, color: theme.text, fontWeight: 500 }}>{service.service}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: theme.accent }}>{formatCompactCurrency(service.revenue)}</span>
                        <span style={{ fontSize: 10, color: theme.muted, width: 32, textAlign: "right" }}>{service.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }} onClick={(event) => event.stopPropagation()}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onSelectProspect(topPick);
                    onOpenView(topPick.analysis ? "analysis" : "detail");
                  }}
                >
                  Ver ficha
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => {
                    onSelectProspect(topPick);
                    onOpenView("kitgen");
                  }}
                >
                  Generar kit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    onSelectProspect(topPick);
                    onOpenView("assets");
                  }}
                >
                  Crear asset
                </Button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Prospectos", value: metrics.totalProspects },
                { label: "Analizados", value: metrics.analyzedProspects },
                { label: "Kits listos", value: metrics.kitsReady },
                { label: "Pot. minimo", value: formatCompactCurrency(metrics.revenueMinTotal) }
              ].map((item) => (
                <div key={item.label} style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, letterSpacing: "-0.02em" }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 14, flex: 1 }}>
              <div style={{ fontSize: 11, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 12 }}>
                Top oportunidades
              </div>
              {metrics.rankedProspects.map((prospect, index) => (
                <div
                  key={prospect.id}
                  onClick={() => {
                    onSelectProspect(prospect);
                    onOpenView(prospect.analysis ? "analysis" : "detail");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom: index < metrics.rankedProspects.length - 1 ? `1px solid ${theme.border}` : "none",
                    cursor: "pointer"
                  }}
                >
                  <span style={{ fontSize: 11, color: theme.dim, fontWeight: 700, width: 16, flexShrink: 0 }}>{index + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {prospect.name}
                    </div>
                    <div style={{ fontSize: 10, color: theme.muted }}>{prospect.industry}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 900, color: scoreColor(prospect.opportunityScore), flexShrink: 0 }}>{prospect.opportunityScore}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 10 }}>
            Acciones recomendadas
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 160 : 220}px,1fr))`, gap: 10 }}>
            {metrics.recommendations.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  const prospect = prospects.find((entry) => entry.id === item.id);
                  if (prospect) {
                    onSelectProspect(prospect);
                    onOpenView(item.targetView);
                  }
                }}
                style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  background: theme.s2,
                  border: `1px solid ${theme.border}`,
                  cursor: "pointer"
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: theme.muted }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
