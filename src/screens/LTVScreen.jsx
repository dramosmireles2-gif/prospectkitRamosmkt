import { useState } from "react";
import { Button, Card, EmptyState } from "../components/Primitives";
import { theme } from "../app/theme";
import { formatCurrency } from "../utils/format";

const RETENTION = {
  optimista:  { label: "Optimista",  color: theme.accent,  monthly: 0.97, bonus: 1.15 },
  realista:   { label: "Realista",   color: theme.yellow,  monthly: 0.93, bonus: 1.0  },
  pesimista:  { label: "Pesimista",  color: theme.red,     monthly: 0.87, bonus: 0.85 }
};

function ltv(monthlyRevenue, months, retention) {
  let total = 0;
  let current = monthlyRevenue * retention.bonus;
  for (let i = 0; i < months; i++) {
    total += current;
    current *= retention.monthly;
  }
  return Math.round(total);
}

function Bar({ value, max, color, label, sub }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 130, fontSize: 12, color: theme.muted, textAlign: "right", flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 8, background: theme.s3, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.5s ease" }} />
      </div>
      <div style={{ width: 100, flexShrink: 0, textAlign: "right" }}>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{formatCurrency(value)}</span>
        {sub ? <span style={{ fontSize: 10, color: theme.dim }}> {sub}</span> : null}
      </div>
    </div>
  );
}

function getActiveProposal(proposals) {
  if (!proposals?.length) return null;
  const priority = ["aceptada", "negociacion", "enviada", "borrador"];
  for (const status of priority) {
    const found = proposals.find((p) => p.status === status);
    if (found) return found;
  }
  return proposals[0];
}

export function LTVScreen({ prospect, proposals, onBack }) {
  const [scenario, setScenario] = useState("realista");

  if (!prospect) {
    return <EmptyState title="Selecciona un prospecto" description="El cálculo de LTV requiere un prospecto con análisis." />;
  }

  const activeProposal = getActiveProposal(proposals);
  // Use actual negotiated monthly recurring from proposal, fall back to analysis estimate
  const proposalMonthly = activeProposal
    ? (activeProposal.services || [])
        .filter((s) => s.type === "mensual" || s.type === "setup+mensual")
        .reduce((sum, s) => sum + (s.negotiatedPrice || 0), 0)
    : 0;
  const monthly = proposalMonthly > 0 ? proposalMonthly : (prospect.analysis?.revenue?.min || 0);
  const ret = RETENTION[scenario];

  if (!monthly) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ height: 58, borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", padding: "0 28px", gap: 16, background: theme.bg }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: theme.dim, marginBottom: 2 }}>{prospect.name}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Valor de Cliente (LTV)</div>
          </div>
          <Button variant="ghost" size="sm" onClick={onBack}>← Volver</Button>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EmptyState title="Genera el análisis primero" description="El LTV se calcula a partir del revenue estimado en el análisis heurístico." />
        </div>
      </div>
    );
  }

  const ltv3  = ltv(monthly, 3,  ret);
  const ltv6  = ltv(monthly, 6,  ret);
  const ltv12 = ltv(monthly, 12, ret);
  const ltv24 = ltv(monthly, 24, ret);
  const maxVal = Math.max(ltv3, ltv6, ltv12, ltv24);

  const services = (prospect.analysis?.recommendedServices || []).map((s) => ({
    ...s,
    ltv12: ltv(s.revenue, 12, ret)
  }));
  const maxSvc = Math.max(...services.map((s) => s.ltv12), 1);

  const churnMonth = Math.ceil(Math.log(0.5) / Math.log(ret.monthly));

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ height: 58, borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", padding: "0 28px", gap: 16, background: theme.bg, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.dim, marginBottom: 2, letterSpacing: "0.04em" }}>{prospect.name}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Valor de Cliente (LTV)</div>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>← Volver</Button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Source banner */}
        {activeProposal && proposalMonthly > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "rgba(0,255,136,0.06)", border: `1px solid ${theme.accentBorder}`, borderRadius: 10, fontSize: 12, color: theme.muted }}>
            <span style={{ fontSize: 16 }}>📄</span>
            <span>Base mensual tomada de <strong style={{ color: theme.accent }}>Propuesta v{activeProposal.version}</strong> — mensual recurrente negociado.</span>
          </div>
        )}
        {/* Scenario selector */}
        <div style={{ display: "flex", gap: 8 }}>
          {Object.entries(RETENTION).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setScenario(key)}
              style={{
                padding: "7px 18px", borderRadius: 8, fontSize: 12, fontWeight: scenario === key ? 700 : 400, cursor: "pointer",
                background: scenario === key ? `${cfg.color}18` : "rgba(255,255,255,0.04)",
                color: scenario === key ? cfg.color : theme.muted,
                border: `1px solid ${scenario === key ? `${cfg.color}44` : theme.border}`
              }}
            >
              {cfg.label}
              <span style={{ fontSize: 10, marginLeft: 6, opacity: 0.7 }}>{Math.round(ret.monthly * 100)}% ret./mes</span>
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", fontSize: 11, color: theme.dim }}>
            Base mensual: <strong style={{ color: theme.text, marginLeft: 5 }}>{formatCurrency(monthly)}</strong>
          </div>
        </div>

        {/* Hero metric */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "LTV 3 meses",  value: ltv3,  sub: "trimestre" },
            { label: "LTV 6 meses",  value: ltv6,  sub: "semestre" },
            { label: "LTV 12 meses", value: ltv12, sub: "anual" },
            { label: "LTV 24 meses", value: ltv24, sub: "2 años" }
          ].map((m, i) => (
            <div key={m.label} style={{ background: i === 2 ? `linear-gradient(135deg, ${theme.s2}, rgba(0,255,136,0.05))` : theme.s2, border: `1px solid ${i === 2 ? theme.accentBorder : theme.border}`, borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{m.label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: i === 2 ? theme.accent : ret.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{formatCurrency(m.value)}</div>
              <div style={{ fontSize: 10, color: theme.muted, marginTop: 4 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Timeline bars */}
        <Card style={{ padding: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 18 }}>Proyección acumulada</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Bar value={ltv3}  max={maxVal} color={ret.color} label="3 meses"  />
            <Bar value={ltv6}  max={maxVal} color={ret.color} label="6 meses"  />
            <Bar value={ltv12} max={maxVal} color={ret.color} label="12 meses" />
            <Bar value={ltv24} max={maxVal} color={ret.color} label="24 meses" />
          </div>
          <div style={{ marginTop: 16, padding: "10px 14px", background: theme.s3, borderRadius: 8, fontSize: 11, color: theme.muted }}>
            Con retención del {Math.round(ret.monthly * 100)}% mensual, el cliente deja de ser rentable alrededor del mes <strong style={{ color: theme.text }}>{churnMonth}</strong> en el escenario {ret.label.toLowerCase()}.
          </div>
        </Card>

        {/* Per-service LTV */}
        {services.length > 0 && (
          <Card style={{ padding: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 18 }}>LTV por servicio — 12 meses</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {services.map((s) => (
                <Bar key={s.service} value={s.ltv12} max={maxSvc} color={ret.color} label={`${s.icon} ${s.service}`} sub="/12m" />
              ))}
            </div>
          </Card>
        )}

        {/* Upsell opportunities */}
        <div style={{ padding: "16px 20px", background: theme.accentBg, border: `1px solid ${theme.accentBorder}`, borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.accent, marginBottom: 8 }}>Potencial de upsell</div>
          <div style={{ fontSize: 13, color: theme.muted, lineHeight: 1.65 }}>
            Si agregas un segundo servicio al mes 3 y un tercero al mes 6, el LTV a 12 meses puede crecer hasta{" "}
            <strong style={{ color: theme.text }}>{formatCurrency(Math.round(ltv12 * 1.9))}</strong> en el escenario {ret.label.toLowerCase()}.
          </div>
        </div>
      </div>
    </div>
  );
}
