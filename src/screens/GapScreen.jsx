import { Button, Card, EmptyState } from "../components/Primitives";
import { theme } from "../app/theme";
import { useIsMobile } from "../hooks/useIsMobile";

const INDUSTRY_BENCHMARK = {
  restaurante:  { web: 72, mobile: 68, social: 80, conversion: 65, functionality: 58 },
  automotriz:   { web: 65, mobile: 60, social: 55, conversion: 70, functionality: 62 },
  fotografia:   { web: 78, mobile: 72, social: 85, conversion: 60, functionality: 55 },
  salud:        { web: 70, mobile: 65, social: 60, conversion: 75, functionality: 68 },
  reposteria:   { web: 55, mobile: 52, social: 82, conversion: 58, functionality: 48 },
  belleza:      { web: 60, mobile: 58, social: 78, conversion: 62, functionality: 52 },
  fitness:      { web: 68, mobile: 70, social: 80, conversion: 65, functionality: 60 },
  inmobiliaria: { web: 80, mobile: 75, social: 65, conversion: 72, functionality: 70 },
  educacion:    { web: 75, mobile: 70, social: 62, conversion: 68, functionality: 65 },
  default:      { web: 65, mobile: 60, social: 65, conversion: 62, functionality: 55 }
};

const DIMENSION_LABELS = {
  web:           "Calidad del sitio web",
  mobile:        "Experiencia móvil",
  social:        "Presencia en redes",
  conversion:    "Oportunidades de conversión",
  functionality: "Funcionalidades clave"
};

function getIndustryKey(industry = "") {
  const k = industry.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (k.includes("restaur") || k.includes("comida"))   return "restaurante";
  if (k.includes("auto")    || k.includes("taller"))   return "automotriz";
  if (k.includes("foto")    || k.includes("video"))    return "fotografia";
  if (k.includes("salud")   || k.includes("dental"))   return "salud";
  if (k.includes("reposter")|| k.includes("pastel"))   return "reposteria";
  if (k.includes("belleza") || k.includes("salon"))    return "belleza";
  if (k.includes("fitness") || k.includes("gym"))      return "fitness";
  if (k.includes("inmobil"))                           return "inmobiliaria";
  if (k.includes("educa")   || k.includes("academia")) return "educacion";
  return "default";
}

function GapBar({ label, prospectVal, benchmarkVal }) {
  const gap = benchmarkVal - prospectVal;
  const isAhead = gap <= 0;
  const gapColor = isAhead ? theme.accent : gap >= 30 ? theme.red : gap >= 15 ? theme.yellow : theme.blue;
  const maxVal = Math.max(prospectVal, benchmarkVal, 1);

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: theme.text, fontWeight: 500 }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: theme.muted }}>Industria: <strong style={{ color: theme.text }}>{benchmarkVal}</strong></span>
          <span style={{ fontSize: 11, color: isAhead ? theme.accent : gapColor, fontWeight: 700 }}>
            {isAhead ? `+${Math.abs(gap)} adelante` : `−${gap} gap`}
          </span>
        </div>
      </div>

      {/* Prospect bar */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 10, color: theme.muted, marginBottom: 3 }}>
          Prospecto <strong style={{ color: theme.text }}>{prospectVal}</strong>
        </div>
        <div style={{ height: 8, background: theme.s3, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(prospectVal / 100) * 100}%`, background: theme.blue, borderRadius: 4, transition: "width 0.5s ease" }} />
        </div>
      </div>

      {/* Benchmark bar */}
      <div>
        <div style={{ fontSize: 10, color: theme.dim, marginBottom: 3 }}>Benchmark industria</div>
        <div style={{ height: 8, background: theme.s3, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(benchmarkVal / 100) * 100}%`, background: `${gapColor}55`, borderRadius: 4, transition: "width 0.5s ease" }} />
        </div>
      </div>

      {/* Gap fill indicator */}
      {!isAhead && (
        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ flex: 1, height: 3, background: theme.s3, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(prospectVal / benchmarkVal) * 100}%`, background: gapColor, borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 10, color: gapColor, fontWeight: 600, flexShrink: 0 }}>
            {Math.round((prospectVal / benchmarkVal) * 100)}% del estándar
          </span>
        </div>
      )}
    </div>
  );
}

export function GapScreen({ prospect, onBack }) {
  const isMobile = useIsMobile();
  if (!prospect) {
    return <EmptyState title="Selecciona un prospecto" description="El análisis de brecha necesita un prospecto activo." />;
  }

  if (!prospect.analysis) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ minHeight: isMobile ? 72 : 58, borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: isMobile ? "flex-start" : "center", flexWrap: isMobile ? "wrap" : "nowrap", padding: isMobile ? "12px 16px" : "0 28px", gap: 16, background: theme.bg }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: theme.dim, marginBottom: 2 }}>{prospect.name}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Brecha Competitiva</div>
          </div>
          <Button variant="ghost" size="sm" onClick={onBack}>← Volver</Button>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EmptyState title="Genera el análisis primero" description="La brecha competitiva usa el score breakdown del análisis heurístico." />
        </div>
      </div>
    );
  }

  const industryKey = getIndustryKey(prospect.industry);
  const benchmark = INDUSTRY_BENCHMARK[industryKey] || INDUSTRY_BENCHMARK.default;
  const breakdown = prospect.analysis.scoreBreakdown || [];

  // Map breakdown labels to benchmark keys
  const dimMap = [
    { key: "web",           idx: 0 },
    { key: "mobile",        idx: 1 },
    { key: "social",        idx: 2 },
    { key: "conversion",    idx: 3 },
    { key: "functionality", idx: 4 }
  ];

  const dims = dimMap.map(({ key, idx }) => ({
    key,
    label: DIMENSION_LABELS[key],
    prospectVal: breakdown[idx]?.value || 0,
    benchmarkVal: benchmark[key]
  }));

  const totalGap = dims.reduce((sum, d) => sum + Math.max(0, d.benchmarkVal - d.prospectVal), 0);
  const avgGap = Math.round(totalGap / dims.length);
  const criticalGaps = dims.filter((d) => d.benchmarkVal - d.prospectVal >= 25);
  const overallPct = Math.round((dims.reduce((s, d) => s + d.prospectVal, 0) / dims.reduce((s, d) => s + d.benchmarkVal, 0)) * 100);

  // Missing features grouped by severity
  const critical = (prospect.analysis.missingFeatures || []).filter((f) => f.critical);
  const normal   = (prospect.analysis.missingFeatures || []).filter((f) => !f.critical);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ minHeight: isMobile ? 72 : 58, borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: isMobile ? "flex-start" : "center", flexWrap: isMobile ? "wrap" : "nowrap", padding: isMobile ? "12px 16px" : "0 28px", gap: 16, background: theme.bg, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.dim, marginBottom: 2, letterSpacing: "0.04em" }}>{prospect.name}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Brecha Competitiva</div>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>← Volver</Button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 16 : 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12 }}>
          <div style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Nivel vs industria</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: overallPct >= 80 ? theme.accent : overallPct >= 60 ? theme.yellow : theme.red, letterSpacing: "-0.03em" }}>{overallPct}%</div>
            <div style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>{prospect.industry}</div>
          </div>
          <div style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Brecha promedio</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: avgGap >= 25 ? theme.red : avgGap >= 12 ? theme.yellow : theme.accent, letterSpacing: "-0.03em" }}>{avgGap} pts</div>
            <div style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>por dimensión</div>
          </div>
          <div style={{ background: criticalGaps.length > 0 ? "rgba(255,68,85,0.08)" : theme.accentBg, border: `1px solid ${criticalGaps.length > 0 ? "rgba(255,68,85,0.25)" : theme.accentBorder}`, borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Gaps críticos</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: criticalGaps.length > 0 ? theme.red : theme.accent, letterSpacing: "-0.03em" }}>{criticalGaps.length}</div>
            <div style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>de {dims.length} dimensiones</div>
          </div>
        </div>

        {/* Dimension bars */}
        <Card style={{ padding: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 20 }}>
            Comparativa vs benchmark · <span style={{ color: theme.muted, fontWeight: 400 }}>{prospect.industry}</span>
          </div>
          {dims.map((d) => (
            <GapBar key={d.key} label={d.label} prospectVal={d.prospectVal} benchmarkVal={d.benchmarkVal} />
          ))}
        </Card>

        {/* Missing features */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
          <Card style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.red, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              Brechas críticas ({critical.length})
            </div>
            {critical.length === 0 ? (
              <div style={{ fontSize: 12, color: theme.accent }}>✓ Sin brechas críticas detectadas</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {critical.map((f) => (
                  <div key={f.name} style={{ display: "flex", gap: 10, padding: "10px 14px", background: "rgba(255,68,85,0.06)", borderRadius: 8, border: "1px solid rgba(255,68,85,0.2)", alignItems: "flex-start" }}>
                    <span style={{ color: theme.red, fontWeight: 900, fontSize: 14, flexShrink: 0 }}>×</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{f.name}</div>
                      <div style={{ fontSize: 10, color: theme.red, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>Urgente</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              Mejoras recomendadas ({normal.length})
            </div>
            {normal.length === 0 ? (
              <div style={{ fontSize: 12, color: theme.accent }}>✓ Sin mejoras adicionales detectadas</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {normal.map((f) => (
                  <div key={f.name} style={{ display: "flex", gap: 8, padding: "8px 12px", background: theme.s3, borderRadius: 7, border: `1px solid ${theme.border}`, alignItems: "center" }}>
                    <span style={{ color: theme.muted, fontSize: 12 }}>○</span>
                    <span style={{ fontSize: 12, color: theme.muted }}>{f.name}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Opportunity message */}
        <div style={{ padding: "16px 20px", background: theme.s2, border: `1px solid ${theme.accentBorder}`, borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.accent, marginBottom: 6 }}>Ángulo de venta</div>
          <div style={{ fontSize: 13, color: theme.muted, lineHeight: 1.7 }}>
            <strong style={{ color: theme.text }}>{prospect.name}</strong> está al{" "}
            <strong style={{ color: overallPct >= 80 ? theme.accent : overallPct >= 60 ? theme.yellow : theme.red }}>{overallPct}%</strong>{" "}
            del estándar de su industria ({prospect.industry}).
            {criticalGaps.length > 0
              ? ` Las ${criticalGaps.length} brecha${criticalGaps.length > 1 ? "s" : ""} crítica${criticalGaps.length > 1 ? "s" : ""} en ${criticalGaps.map((d) => d.label.toLowerCase()).join(" y ")} son el punto de entrada ideal para la conversación comercial.`
              : " Está bien posicionado — el argumento de venta es optimización y crecimiento, no corrección urgente."}
          </div>
        </div>
      </div>
    </div>
  );
}
