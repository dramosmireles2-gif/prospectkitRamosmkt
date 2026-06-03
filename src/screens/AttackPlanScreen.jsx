import { useState } from "react";
import { TemperatureBadge } from "../components/Primitives";
import { NEXT_ACTION_TYPES, PIPELINE_STAGES } from "../app/constants";
import { theme } from "../app/theme";
import { formatCurrency } from "../utils/format";
import { useIsMobile } from "../hooks/useIsMobile";

const TEMP_WEIGHT = { urgente: 40, caliente: 30, tibio: 15, frio: 5 };
const STAGE_WEIGHT = { lead: 4, contactado: 8, respondio: 14, reunion: 20, propuesta: 26, negociacion: 32, ganado: 0, perdido: 0 };

function priorityScore(prospect) {
  const today = new Date().toISOString().split("T")[0];
  const overdue = prospect.nextActionDate && prospect.nextActionDate < today ? 22 : prospect.nextActionDate === today ? 12 : 0;
  const temp = TEMP_WEIGHT[prospect.leadTemperature] || 5;
  const stage = STAGE_WEIGHT[prospect.pipelineStage] || 0;
  const opp = Math.round(prospect.opportunityScore * 0.28);
  return temp + stage + overdue + opp;
}

function tier(score) {
  if (score >= 72) return "today";
  if (score >= 48) return "week";
  return "radar";
}

const TIERS = {
  today: { label: "Actuar hoy", color: theme.red, bg: "rgba(255,68,85,0.08)", border: "rgba(255,68,85,0.2)", desc: "Accion urgente o vencida" },
  week: { label: "Esta semana", color: theme.yellow, bg: "rgba(255,187,68,0.06)", border: "rgba(255,187,68,0.18)", desc: "Alta prioridad" },
  radar: { label: "En el radar", color: theme.muted, bg: "rgba(255,255,255,0.02)", border: theme.border, desc: "Mantener visible" }
};

function ActionChip({ prospect }) {
  const today = new Date().toISOString().split("T")[0];
  const overdue = prospect.nextActionDate && prospect.nextActionDate < today;
  const isToday = prospect.nextActionDate === today;
  const config = NEXT_ACTION_TYPES.find((item) => item.id === prospect.nextActionType);
  if (!config) return null;
  const color = overdue ? theme.red : isToday ? theme.yellow : theme.muted;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color, fontWeight: overdue || isToday ? 700 : 400 }}>
      {overdue ? "!" : ""}{config.icon} {config.label}
      {prospect.nextActionDate ? <span style={{ color: theme.dim }}>· {prospect.nextActionDate}</span> : null}
    </span>
  );
}

function ProspectRow({ prospect, rank, onSelect, isMobile }) {
  const [hovered, setHovered] = useState(false);
  const score = priorityScore(prospect);
  const currentTier = tier(score);
  const tierConfig = TIERS[currentTier];
  const stage = PIPELINE_STAGES.find((item) => item.id === prospect.pipelineStage);

  return (
    <div
      onClick={() => onSelect(prospect)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: isMobile ? "flex-start" : "center",
        flexDirection: isMobile ? "column" : "row",
        gap: 16,
        padding: "14px 20px",
        background: hovered ? theme.s3 : theme.s2,
        border: `1px solid ${hovered ? theme.borderStrong : theme.border}`,
        borderRadius: 12,
        cursor: "pointer",
        transition: "all 0.12s ease"
      }}
    >
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: theme.s3, border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: theme.muted, flexShrink: 0 }}>
        {rank}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prospect.name}</span>
          <TemperatureBadge temperature={prospect.leadTemperature} size="sm" />
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: theme.muted }}>{prospect.industry} · {prospect.city}</span>
          {prospect.nextActionType ? <ActionChip prospect={prospect} /> : <span style={{ fontSize: 11, color: theme.dim }}>Sin proxima accion</span>}
        </div>
      </div>

      {stage ? (
        <div style={{ padding: "3px 10px", borderRadius: 20, background: `${stage.color}18`, border: `1px solid ${stage.color}44`, fontSize: 11, fontWeight: 600, color: stage.color, flexShrink: 0 }}>
          {stage.label}
        </div>
      ) : null}

      {prospect.analysis?.revenue?.min > 0 ? (
        <div style={{ textAlign: isMobile ? "left" : "right", flexShrink: 0, minWidth: 80 }}>
          <div style={{ fontSize: 10, color: theme.dim }}>Valor 1er ano</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: theme.accent }}>{formatCurrency(prospect.analysis?.pricingSummary?.firstYear?.min || prospect.analysis.revenue.min)}</div>
        </div>
      ) : null}

      <div style={{ width: 44, height: 44, borderRadius: 10, background: tierConfig.bg, border: `1px solid ${tierConfig.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 900, color: tierConfig.color }}>{score}</span>
      </div>
    </div>
  );
}

function TierSection({ tierId, prospects, onSelect, isMobile }) {
  const config = TIERS[tierId];
  if (!prospects.length) return null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: config.color, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: config.color }}>{config.label}</span>
        <span style={{ fontSize: 11, color: theme.muted }}>{config.desc}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: config.color, background: config.bg, border: `1px solid ${config.border}`, borderRadius: 20, padding: "1px 10px" }}>{prospects.length}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {prospects.map((prospect, index) => (
          <ProspectRow key={prospect.id} prospect={prospect} rank={index + 1} onSelect={onSelect} isMobile={isMobile} />
        ))}
      </div>
    </div>
  );
}

function MetricsCarousel({ items }) {
  return (
    <div style={{ width: "100%", maxWidth: "100%", alignSelf: "stretch", display: "flex", gap: 10, overflowX: "auto", paddingTop: 14, paddingBottom: 4, scrollbarWidth: "none", boxSizing: "border-box" }}>
      {items.map((item) => (
        <div key={item.label} style={{ minWidth: 132, background: `linear-gradient(180deg, ${theme.s2} 0%, ${theme.s1} 100%)`, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "12px 14px", flexShrink: 0 }}>
          <div style={{ fontSize: 19, fontWeight: 900, color: item.color, letterSpacing: "-0.02em" }}>{item.value}</div>
          <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 4, lineHeight: 1.3 }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function FilterBar({ filter, setFilter, overdueCount, noActionCount, mobile = false }) {
  const filters = [
    { id: "all", label: "Todos activos" },
    { id: "overdue", label: `Vencidos (${overdueCount})` },
    { id: "no-action", label: `Sin accion (${noActionCount})` }
  ];

  return (
    <div style={{ width: "100%", maxWidth: "100%", alignSelf: "stretch", display: "flex", gap: 8, flexWrap: mobile ? "nowrap" : "wrap", overflowX: mobile ? "auto" : "visible", paddingBottom: mobile ? 8 : 0, scrollbarWidth: "none", boxSizing: "border-box" }}>
      {filters.map((item) => (
        <button
          key={item.id}
          onClick={() => setFilter(item.id)}
          style={{
            padding: mobile ? "8px 12px" : "5px 12px",
            borderRadius: mobile ? 999 : 7,
            fontSize: 12,
            fontWeight: filter === item.id ? 700 : mobile ? 500 : 400,
            whiteSpace: "nowrap",
            background: filter === item.id ? theme.accentBg : mobile ? theme.s2 : "rgba(255,255,255,0.04)",
            color: filter === item.id ? theme.accent : theme.muted,
            border: `1px solid ${filter === item.id ? theme.accentBorder : theme.border}`,
            cursor: "pointer",
            flexShrink: 0
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function AttackPlanScreen({ prospects, onSelectProspect }) {
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState("all");

  const active = prospects.filter((prospect) => !["ganado", "perdido"].includes(prospect.pipelineStage));
  const todayDate = new Date().toISOString().split("T")[0];

  const filtered = filter === "all"
    ? active
    : filter === "overdue"
      ? active.filter((prospect) => prospect.nextActionDate && prospect.nextActionDate < todayDate)
      : filter === "no-action"
        ? active.filter((prospect) => !prospect.nextActionType)
        : active;

  const ranked = [...filtered].sort((left, right) => priorityScore(right) - priorityScore(left));
  const today = ranked.filter((prospect) => tier(priorityScore(prospect)) === "today");
  const week = ranked.filter((prospect) => tier(priorityScore(prospect)) === "week");
  const radar = ranked.filter((prospect) => tier(priorityScore(prospect)) === "radar");

  const overdueCount = active.filter((prospect) => prospect.nextActionDate && prospect.nextActionDate < todayDate).length;
  const noActionCount = active.filter((prospect) => !prospect.nextActionType).length;
  const totalRevenue = today.reduce((sum, prospect) => sum + (prospect.analysis?.pricingSummary?.firstYear?.min || prospect.analysis?.revenue?.min || 0), 0);
  const metricItems = [
    { label: "Actuar hoy", value: today.length, color: theme.red },
    { label: "Esta semana", value: week.length, color: theme.yellow },
    { label: "Acciones vencidas", value: overdueCount, color: theme.red },
    { label: "Sin accion prog.", value: noActionCount, color: theme.muted },
    { label: "Valor 1er ano", value: formatCurrency(totalRevenue), color: theme.accent }
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: isMobile ? "16px 16px 12px" : "20px 24px 12px", borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>CRM</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: theme.text, letterSpacing: "-0.02em" }}>Plan de Ataque</div>
      </div>

      {!isMobile ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, max-content))", gap: 10, padding: "14px 24px 0", flexShrink: 0 }}>
            {metricItems.map((item) => (
              <div key={item.label} style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "10px 16px", minWidth: 110 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: item.color, letterSpacing: "-0.02em" }}>{item.value}</div>
                <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>{item.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 6, padding: "12px 24px", flexShrink: 0, flexWrap: "wrap", alignItems: "center" }}>
            <FilterBar filter={filter} setFilter={setFilter} overdueCount={overdueCount} noActionCount={noActionCount} />
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: theme.dim }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: theme.red, display: "inline-block" }} /> Actuar hoy
              <span style={{ width: 8, height: 8, borderRadius: 2, background: theme.yellow, display: "inline-block", marginLeft: 6 }} /> Esta semana
              <span style={{ width: 8, height: 8, borderRadius: 2, background: theme.muted, display: "inline-block", marginLeft: 6 }} /> En el radar
            </div>
          </div>
        </>
      ) : (
        <div
          style={{
            flexShrink: 0,
            padding: "12px 16px 8px",
            background: "rgba(10,10,10,0.92)",
            borderBottom: `1px solid ${theme.border}`,
            backdropFilter: "blur(16px)"
          }}
        >
          <MetricsCarousel items={metricItems} />
          <FilterBar filter={filter} setFilter={setFilter} overdueCount={overdueCount} noActionCount={noActionCount} mobile={true} />
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "0 16px 24px" : "0 24px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
        {ranked.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: theme.muted, fontSize: 14 }}>
            No hay prospectos activos con este filtro.
          </div>
        ) : (
          <>
            <TierSection tierId="today" prospects={today} onSelect={(prospect) => onSelectProspect(prospect)} isMobile={isMobile} />
            <TierSection tierId="week" prospects={week} onSelect={(prospect) => onSelectProspect(prospect)} isMobile={isMobile} />
            <TierSection tierId="radar" prospects={radar} onSelect={(prospect) => onSelectProspect(prospect)} isMobile={isMobile} />
          </>
        )}
      </div>
    </div>
  );
}
