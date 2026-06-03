import { useRef, useState } from "react";
import { TemperatureBadge } from "../components/Primitives";
import { PIPELINE_STAGES, NEXT_ACTION_TYPES } from "../app/constants";
import { theme } from "../app/theme";
import { formatCurrency } from "../utils/format";

function scoreColor(s) {
  if (s >= 80) return theme.accent;
  if (s >= 60) return theme.yellow;
  if (s >= 40) return theme.blue;
  return theme.muted;
}

function PipelineCard({ prospect, onSelect, onDragStart }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, prospect.id)}
      onClick={() => onSelect(prospect)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? theme.s3 : theme.s2,
        border: `1px solid ${hovered ? theme.borderStrong : theme.border}`,
        borderRadius: 10,
        padding: "12px 14px",
        cursor: "grab",
        transition: "all 0.15s ease",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        userSelect: "none"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {prospect.name}
          </div>
          <div style={{ fontSize: 11, color: theme.muted, marginTop: 1 }}>
            {prospect.industry} · {prospect.city}
          </div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: scoreColor(prospect.opportunityScore), flexShrink: 0, lineHeight: 1 }}>
          {prospect.opportunityScore}
        </div>
      </div>

      {/* Temperature */}
      <TemperatureBadge temperature={prospect.leadTemperature} size="sm" />

      {/* Revenue estimate */}
      {prospect.analysis?.revenue?.min > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: theme.muted }}>Valor estimado:</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: theme.accent }}>
            {formatCurrency(prospect.analysis.revenue.min)}
          </span>
        </div>
      )}

      {/* Channels */}
      <div style={{ display: "flex", gap: 5 }}>
        {prospect.website   && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: theme.s3, color: theme.muted, border: `1px solid ${theme.border}` }}>🌐</span>}
        {prospect.instagram && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: theme.s3, color: theme.muted, border: `1px solid ${theme.border}` }}>📷</span>}
        {prospect.whatsapp  && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: theme.s3, color: theme.muted, border: `1px solid ${theme.border}` }}>💬</span>}
        {prospect.kit       && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: theme.accentBg, color: theme.accent, border: `1px solid ${theme.accentBorder}` }}>Kit ✓</span>}
      </div>

      {/* Next action */}
      {prospect.nextActionType && prospect.nextActionDate ? (() => {
        const today = new Date().toISOString().split("T")[0];
        const overdue = prospect.nextActionDate < today;
        const isToday = prospect.nextActionDate === today;
        const color = overdue ? theme.red : isToday ? theme.yellow : theme.muted;
        const cfg = NEXT_ACTION_TYPES.find(t => t.id === prospect.nextActionType);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color }}>
            <span>{cfg?.icon || "📋"}</span>
            <span style={{ fontWeight: overdue || isToday ? 700 : 400 }}>
              {overdue ? "⚠ " : ""}{cfg?.label || prospect.nextActionType} · {prospect.nextActionDate}
            </span>
          </div>
        );
      })() : null}
    </div>
  );
}

function PipelineColumn({ stage, prospects, onDragOver, onDrop, onSelect, onDragStart, isDragOver }) {
  const totalRevenue = prospects.reduce((sum, p) => sum + (p.analysis?.revenue?.min || 0), 0);

  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage.id)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        minWidth: 220,
        maxWidth: 240,
        flexShrink: 0,
        background: isDragOver ? `${stage.bg}` : "transparent",
        borderRadius: 12,
        border: isDragOver ? `1.5px dashed ${stage.color}` : `1.5px solid transparent`,
        transition: "all 0.15s ease"
      }}
    >
      {/* Column header */}
      <div style={{ padding: "10px 12px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{stage.label}</span>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, color: stage.color,
            background: stage.bg, borderRadius: 20,
            padding: "1px 8px", border: `1px solid ${stage.color}33`
          }}>
            {prospects.length}
          </span>
        </div>
        {totalRevenue > 0 && (
          <div style={{ fontSize: 10, color: theme.muted, paddingLeft: 15 }}>
            {formatCurrency(totalRevenue)} est.
          </div>
        )}
      </div>

      {/* Cards */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, padding: "0 8px 12px", minHeight: 60 }}>
        {prospects.map((p) => (
          <PipelineCard
            key={p.id}
            prospect={p}
            onSelect={onSelect}
            onDragStart={onDragStart}
          />
        ))}
        {prospects.length === 0 && (
          <div style={{
            height: 60, borderRadius: 8, border: `1.5px dashed ${theme.dim}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: theme.dim
          }}>
            Arrastra aquí
          </div>
        )}
      </div>
    </div>
  );
}

function PipelineMetrics({ prospects }) {
  const total = prospects.length;
  const ganados = prospects.filter(p => p.pipelineStage === "ganado").length;
  const activos = prospects.filter(p => !["ganado", "perdido"].includes(p.pipelineStage)).length;
  const revenueTotal = prospects
    .filter(p => !["perdido"].includes(p.pipelineStage))
    .reduce((sum, p) => sum + (p.analysis?.revenue?.min || 0), 0);
  const tasaCierre = total > 0 ? Math.round((ganados / total) * 100) : 0;
  const calientes = prospects.filter(p => ["caliente", "urgente"].includes(p.leadTemperature)).length;

  const metrics = [
    { label: "Prospectos activos", value: activos, color: theme.blue },
    { label: "Leads calientes",    value: calientes, color: theme.red },
    { label: "Ganados",            value: ganados,  color: theme.accent },
    { label: "Tasa de cierre",     value: `${tasaCierre}%`, color: theme.yellow },
    { label: "Pipeline total",     value: formatCurrency(revenueTotal), color: theme.purple }
  ];

  return (
    <div style={{ display: "flex", gap: 10, padding: "0 24px 16px", flexWrap: "wrap" }}>
      {metrics.map((m) => (
        <div key={m.label} style={{
          background: theme.s2, border: `1px solid ${theme.border}`,
          borderRadius: 10, padding: "10px 16px", display: "flex", flexDirection: "column", gap: 2, minWidth: 120
        }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: m.color, letterSpacing: "-0.02em" }}>{m.value}</div>
          <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{m.label}</div>
        </div>
      ))}
    </div>
  );
}

export function PipelineScreen({ prospects, onUpdateStage, onSelectProspect }) {
  const [dragOverStage, setDragOverStage] = useState(null);
  const dragProspectId = useRef(null);

  function handleDragStart(e, prospectId) {
    dragProspectId.current = prospectId;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e, stageId) {
    e.preventDefault();
    setDragOverStage(null);
    if (dragProspectId.current) {
      onUpdateStage(dragProspectId.current, stageId);
      dragProspectId.current = null;
    }
  }

  function handleDragEnter(stageId) {
    setDragOverStage(stageId);
  }

  function handleDragLeave() {
    setDragOverStage(null);
  }

  const grouped = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = prospects.filter(p => (p.pipelineStage || "lead") === stage.id);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 12px", borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>CRM</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: theme.text, letterSpacing: "-0.02em" }}>Pipeline</div>
      </div>

      {/* Metrics bar */}
      <div style={{ flexShrink: 0, paddingTop: 14 }}>
        <PipelineMetrics prospects={prospects} />
      </div>

      {/* Kanban board */}
      <div
        style={{
          flex: 1,
          overflowX: "auto",
          overflowY: "hidden",
          padding: "0 24px 24px",
          display: "flex",
          gap: 10,
          alignItems: "flex-start"
        }}
      >
        {PIPELINE_STAGES.map((stage) => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            prospects={grouped[stage.id] || []}
            isDragOver={dragOverStage === stage.id}
            onDragOver={(e) => { handleDragOver(e); handleDragEnter(stage.id); }}
            onDrop={handleDrop}
            onSelect={(p) => { onSelectProspect(p); }}
            onDragStart={handleDragStart}
          />
        ))}
      </div>
    </div>
  );
}
