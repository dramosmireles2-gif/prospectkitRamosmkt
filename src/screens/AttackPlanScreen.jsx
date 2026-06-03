import { useState } from "react";
import { TemperatureBadge } from "../components/Primitives";
import { NEXT_ACTION_TYPES, PIPELINE_STAGES } from "../app/constants";
import { theme } from "../app/theme";
import { formatCurrency } from "../utils/format";

const TEMP_WEIGHT = { urgente: 40, caliente: 30, tibio: 15, frio: 5 };
const STAGE_WEIGHT = { lead: 4, contactado: 8, respondio: 14, reunion: 20, propuesta: 26, negociacion: 32, ganado: 0, perdido: 0 };

function priorityScore(p) {
  const today = new Date().toISOString().split("T")[0];
  const overdue = p.nextActionDate && p.nextActionDate < today ? 22 : p.nextActionDate === today ? 12 : 0;
  const temp = TEMP_WEIGHT[p.leadTemperature] || 5;
  const stage = STAGE_WEIGHT[p.pipelineStage] || 0;
  const opp = Math.round(p.opportunityScore * 0.28);
  return temp + stage + overdue + opp;
}

function tier(score) {
  if (score >= 72) return "today";
  if (score >= 48) return "week";
  return "radar";
}

const TIERS = {
  today: { label: "Actuar hoy",    color: theme.red,    bg: "rgba(255,68,85,0.08)",  border: "rgba(255,68,85,0.2)",  desc: "Acción urgente o vencida" },
  week:  { label: "Esta semana",   color: theme.yellow, bg: "rgba(255,187,68,0.06)", border: "rgba(255,187,68,0.18)", desc: "Alta prioridad" },
  radar: { label: "En el radar",   color: theme.muted,  bg: "rgba(255,255,255,0.02)", border: theme.border,           desc: "Mantener visible" }
};

function ActionChip({ prospect }) {
  const today = new Date().toISOString().split("T")[0];
  const overdue = prospect.nextActionDate && prospect.nextActionDate < today;
  const isToday = prospect.nextActionDate === today;
  const cfg = NEXT_ACTION_TYPES.find((t) => t.id === prospect.nextActionType);
  if (!cfg) return null;
  const color = overdue ? theme.red : isToday ? theme.yellow : theme.muted;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color, fontWeight: overdue || isToday ? 700 : 400 }}>
      {overdue ? "⚠ " : ""}{cfg.icon} {cfg.label}
      {prospect.nextActionDate ? <span style={{ color: theme.dim }}>· {prospect.nextActionDate}</span> : null}
    </span>
  );
}

function ProspectRow({ prospect, rank, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const score = priorityScore(prospect);
  const t = tier(score);
  const tConfig = TIERS[t];
  const stage = PIPELINE_STAGES.find((s) => s.id === prospect.pipelineStage);

  return (
    <div
      onClick={() => onSelect(prospect)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 20px",
        background: hovered ? theme.s3 : theme.s2,
        border: `1px solid ${hovered ? theme.borderStrong : theme.border}`,
        borderRadius: 10,
        cursor: "pointer",
        transition: "all 0.12s ease"
      }}
    >
      {/* Rank */}
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: theme.s3, border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: theme.muted, flexShrink: 0 }}>
        {rank}
      </div>

      {/* Name + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prospect.name}</span>
          <TemperatureBadge temperature={prospect.leadTemperature} size="sm" />
        </div>
        <div style={{ display: "flex", align: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: theme.muted }}>{prospect.industry} · {prospect.city}</span>
          {prospect.nextActionType ? <ActionChip prospect={prospect} /> : <span style={{ fontSize: 11, color: theme.dim }}>Sin próxima acción</span>}
        </div>
      </div>

      {/* Stage pill */}
      {stage ? (
        <div style={{ padding: "3px 10px", borderRadius: 20, background: `${stage.color}18`, border: `1px solid ${stage.color}44`, fontSize: 11, fontWeight: 600, color: stage.color, flexShrink: 0 }}>
          {stage.label}
        </div>
      ) : null}

      {/* Revenue */}
      {prospect.analysis?.revenue?.min > 0 ? (
        <div style={{ textAlign: "right", flexShrink: 0, minWidth: 80 }}>
          <div style={{ fontSize: 10, color: theme.dim }}>Potencial</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: theme.accent }}>{formatCurrency(prospect.analysis.revenue.min)}</div>
        </div>
      ) : null}

      {/* Priority score */}
      <div style={{ width: 44, height: 44, borderRadius: 10, background: tConfig.bg, border: `1px solid ${tConfig.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 900, color: tConfig.color }}>{score}</span>
      </div>
    </div>
  );
}

function TierSection({ tierId, prospects, onSelect }) {
  const config = TIERS[tierId];
  if (!prospects.length) return null;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: config.color, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: config.color }}>{config.label}</span>
        <span style={{ fontSize: 11, color: theme.muted }}>{config.desc}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: config.color, background: config.bg, border: `1px solid ${config.border}`, borderRadius: 20, padding: "1px 10px" }}>{prospects.length}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {prospects.map((p, i) => (
          <ProspectRow key={p.id} prospect={p} rank={i + 1} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

export function AttackPlanScreen({ prospects, onSelectProspect }) {
  const [filter, setFilter] = useState("all");

  const active = prospects.filter((p) => !["ganado", "perdido"].includes(p.pipelineStage));

  const filtered = filter === "all" ? active
    : filter === "overdue" ? active.filter((p) => p.nextActionDate && p.nextActionDate < new Date().toISOString().split("T")[0])
    : filter === "no-action" ? active.filter((p) => !p.nextActionType)
    : active;

  const ranked = [...filtered].sort((a, b) => priorityScore(b) - priorityScore(a));

  const today = ranked.filter((p) => tier(priorityScore(p)) === "today");
  const week  = ranked.filter((p) => tier(priorityScore(p)) === "week");
  const radar = ranked.filter((p) => tier(priorityScore(p)) === "radar");

  const overdueCount = active.filter((p) => p.nextActionDate && p.nextActionDate < new Date().toISOString().split("T")[0]).length;
  const noActionCount = active.filter((p) => !p.nextActionType).length;
  const totalRevenue = today.reduce((sum, p) => sum + (p.analysis?.revenue?.min || 0), 0);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 12px", borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>CRM</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: theme.text, letterSpacing: "-0.02em" }}>Plan de Ataque</div>
      </div>

      {/* Metrics */}
      <div style={{ display: "flex", gap: 10, padding: "14px 24px 0", flexWrap: "wrap", flexShrink: 0 }}>
        {[
          { label: "Actuar hoy",     value: today.length,     color: theme.red    },
          { label: "Esta semana",    value: week.length,      color: theme.yellow },
          { label: "Acciones vencidas", value: overdueCount,  color: theme.red    },
          { label: "Sin acción prog.", value: noActionCount,  color: theme.muted  },
          { label: "Revenue en juego", value: formatCurrency(totalRevenue), color: theme.accent }
        ].map((m) => (
          <div key={m.label} style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "10px 16px", minWidth: 110 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: m.color, letterSpacing: "-0.02em" }}>{m.value}</div>
            <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, padding: "12px 24px", flexShrink: 0 }}>
        {[
          { id: "all",       label: "Todos activos" },
          { id: "overdue",   label: `Vencidos (${overdueCount})` },
          { id: "no-action", label: `Sin acción (${noActionCount})` }
        ].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: filter === f.id ? 700 : 400, background: filter === f.id ? theme.accentBg : "rgba(255,255,255,0.04)", color: filter === f.id ? theme.accent : theme.muted, border: `1px solid ${filter === f.id ? theme.accentBorder : theme.border}`, cursor: "pointer" }}>
            {f.label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: theme.dim }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: theme.red, display: "inline-block" }} /> Actuar hoy
          <span style={{ width: 8, height: 8, borderRadius: 2, background: theme.yellow, display: "inline-block", marginLeft: 6 }} /> Esta semana
          <span style={{ width: 8, height: 8, borderRadius: 2, background: theme.muted, display: "inline-block", marginLeft: 6 }} /> En el radar
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
        {ranked.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: theme.muted, fontSize: 14 }}>
            No hay prospectos activos con este filtro.
          </div>
        ) : (
          <>
            <TierSection tierId="today" prospects={today} onSelect={(p) => onSelectProspect(p)} />
            <TierSection tierId="week"  prospects={week}  onSelect={(p) => onSelectProspect(p)} />
            <TierSection tierId="radar" prospects={radar} onSelect={(p) => onSelectProspect(p)} />
          </>
        )}
      </div>
    </div>
  );
}
