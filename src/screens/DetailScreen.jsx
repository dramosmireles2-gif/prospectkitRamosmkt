import { useState } from "react";
import { Badge, Button, Card, ConfirmDialog, EmptyState, Field, LikelihoodBar, TemperatureBadge } from "../components/Primitives";
import { theme } from "../app/theme";
import { formatDateLabel, formatRelativeTime } from "../utils/format";
import { NEXT_ACTION_TYPES } from "../app/constants";
import { useIsMobile } from "../hooks/useIsMobile";

function SocialRow({ icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        background: value ? theme.s3 : "rgba(255,68,85,0.04)",
        borderRadius: 8,
        border: `1px solid ${value ? theme.border : "rgba(255,68,85,0.15)"}`
      }}
    >
      <span style={{ fontSize: 15, opacity: value ? 1 : 0.4 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 12, color: value ? theme.text : theme.red, fontWeight: value ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || `Sin ${label.toLowerCase()} detectado`}
        </div>
      </div>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: value ? theme.accent : theme.red, flexShrink: 0 }} />
    </div>
  );
}

export function DetailScreen({ prospect, onOpenView, onGenerateAnalysis, onRegenerateAnalysis, onGenerateKit, onMarkContacted, onDelete, onUpdateNotes, onUpdateNextAction, busy }) {
  const isMobile = useIsMobile();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [draftNotes, setDraftNotes] = useState("");
  const [editingAction, setEditingAction] = useState(false);
  const [draftActionType, setDraftActionType] = useState("");
  const [draftActionDate, setDraftActionDate] = useState("");

  if (!prospect) {
    return <EmptyState title="Selecciona un prospecto" description="Abre un prospecto desde el dashboard o el listado para revisar su ficha." />;
  }

  const scoreColor = prospect.opportunityScore >= 85 ? theme.accent : prospect.opportunityScore >= 70 ? theme.yellow : theme.blue;

  function actionStatus() {
    if (!prospect.nextActionDate) return null;
    const today = new Date().toISOString().split("T")[0];
    if (prospect.nextActionDate < today) return "overdue";
    if (prospect.nextActionDate === today) return "today";
    return "upcoming";
  }
  const actionSt = actionStatus();
  const actionColor = actionSt === "overdue" ? theme.red : actionSt === "today" ? theme.yellow : theme.accent;
  const actionConfig = NEXT_ACTION_TYPES.find(t => t.id === prospect.nextActionType);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div
        style={{
          minHeight: isMobile ? 78 : 58,
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
          <div style={{ fontSize: 11, color: theme.dim, marginBottom: 2, letterSpacing: "0.04em" }}>
            {prospect.industry} · {prospect.city}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>{prospect.name}</div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => onOpenView("analysis")}>
          Ver análisis
        </Button>
        <Button variant="primary" size="sm" onClick={() => onOpenView("kitgen")}>
          Generar kit
        </Button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 16 : 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${theme.s2} 0%, rgba(0,255,136,0.03) 100%)`,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: isMobile ? "18px" : "22px 26px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            gap: 20
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: theme.accentBg,
              border: `1px solid ${theme.accentBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 900,
              color: theme.accent,
              flexShrink: 0
            }}
          >
            {prospect.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: theme.text, letterSpacing: "-0.02em", marginBottom: 6 }}>{prospect.name}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <Badge status={prospect.status} />
              <TemperatureBadge temperature={prospect.leadTemperature} size="sm" />
              <span style={{ fontSize: 12, color: theme.muted }}>{prospect.industry}</span>
              <span style={{ fontSize: 12, color: theme.dim }}>·</span>
              <span style={{ fontSize: 12, color: theme.muted }}>{prospect.city}</span>
              <span style={{ fontSize: 12, color: theme.dim }}>·</span>
              <span style={{ fontSize: 12, color: theme.muted }}>{formatDateLabel(prospect.createdAt)}</span>
            </div>
          </div>
          <div style={{ textAlign: isMobile ? "left" : "center", flexShrink: 0, display: "flex", flexDirection: "column", gap: 8, minWidth: isMobile ? 0 : 120, width: isMobile ? "100%" : "auto" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: scoreColor, letterSpacing: "-0.03em", lineHeight: 1 }}>{prospect.opportunityScore}</div>
              <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>Oportunidad</div>
            </div>
            <LikelihoodBar score={prospect.salesLikelihoodScore} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              Presencia digital
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <SocialRow icon="🌐" label="Website" value={prospect.website} />
              <SocialRow icon="📷" label="Instagram" value={prospect.instagram} />
              <SocialRow icon="👥" label="Facebook" value={prospect.facebook} />
              <SocialRow icon="💬" label="WhatsApp" value={prospect.whatsapp} />
            </div>
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Notas</div>
                {editingNotes ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <Button variant="ghost" size="sm" onClick={() => setEditingNotes(false)}>Cancelar</Button>
                    <Button variant="primary" size="sm" onClick={() => { onUpdateNotes(draftNotes); setEditingNotes(false); }}>Guardar</Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => { setDraftNotes(prospect.notes || ""); setEditingNotes(true); }}>Editar</Button>
                )}
              </div>
              {editingNotes ? (
                <Field
                  label=""
                  value={draftNotes}
                  onChange={setDraftNotes}
                  placeholder="Agrega notas sobre el prospecto..."
                  textarea
                  rows={4}
                />
              ) : (
                <div style={{ fontSize: 13, color: prospect.notes ? theme.text : theme.dim, lineHeight: 1.65 }}>
                  {prospect.notes || "Sin notas. Haz clic en Editar para agregar."}
                </div>
              )}
            </Card>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
              {[
                { label: "Última actividad", value: formatRelativeTime(prospect.lastActivityAt) },
                { label: "Creado", value: formatDateLabel(prospect.createdAt) }
              ].map((item) => (
                <Card key={item.label} style={{ padding: 14 }}>
                  <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: theme.text, fontWeight: 600 }}>{item.value}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <Card style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Próxima acción</div>
            {editingAction ? (
              <div style={{ display: "flex", gap: 6 }}>
                <Button variant="ghost" size="sm" onClick={() => setEditingAction(false)}>Cancelar</Button>
                <Button variant="primary" size="sm" onClick={() => { onUpdateNextAction({ type: draftActionType, date: draftActionDate }); setEditingAction(false); }}>Guardar</Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => { setDraftActionType(prospect.nextActionType || ""); setDraftActionDate(prospect.nextActionDate || ""); setEditingAction(true); }}>
                {prospect.nextActionType ? "Editar" : "Programar"}
              </Button>
            )}
          </div>
          {editingAction ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {NEXT_ACTION_TYPES.map(t => (
                  <button key={t.id} onClick={() => setDraftActionType(t.id)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${draftActionType === t.id ? theme.accentBorder : theme.border}`, background: draftActionType === t.id ? theme.accentBg : "transparent", color: draftActionType === t.id ? theme.accent : theme.muted, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    <span>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
              <input type="date" value={draftActionDate} onChange={e => setDraftActionDate(e.target.value)} style={{ background: theme.s3, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "9px 12px", color: theme.text, fontSize: 13, outline: "none" }} />
            </div>
          ) : prospect.nextActionType ? (
            <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${actionColor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                {actionConfig?.icon || "📋"}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{actionConfig?.label || prospect.nextActionType}</div>
                <div style={{ fontSize: 12, color: actionColor, fontWeight: 600 }}>
                  {actionSt === "overdue" ? "⚠ Vencida · " : actionSt === "today" ? "● Hoy · " : ""}
                  {prospect.nextActionDate}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: theme.dim }}>Sin próxima acción programada. Haz clic en Programar.</div>
          )}
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 10 }}>
          <Card onClick={() => onOpenView("analysis")}>
            <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 6 }}>Análisis</div>
            <div style={{ fontSize: 11, color: theme.muted }}>{prospect.analysis ? prospect.analysis.scoreLabel : "Sin análisis aún"}</div>
          </Card>
          <Card onClick={() => onOpenView("kitgen")}>
            <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 6 }}>Kit</div>
            <div style={{ fontSize: 11, color: theme.muted }}>{prospect.kit ? "Listo para usar" : "Genera mensajes y propuesta"}</div>
          </Card>
          <Card onClick={() => onOpenView("assets")}>
            <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 6 }}>Assets</div>
            <div style={{ fontSize: 11, color: theme.muted }}>Exporta piezas visuales PNG/JPG</div>
          </Card>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 10 }}>Acciones</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Button variant="secondary" size="sm" onClick={prospect.analysis ? onRegenerateAnalysis : onGenerateAnalysis} disabled={busy}>
                {prospect.analysis ? "Regenerar análisis" : "Generar análisis"}
              </Button>
              <Button variant="accent" size="sm" onClick={onGenerateKit} disabled={busy}>
                {prospect.kit ? "Actualizar kit" : "Generar kit"}
              </Button>
              {prospect.status !== "contacted" ? (
                <Button variant="ghost" size="sm" onClick={onMarkContacted} disabled={busy}>
                  Marcar contactado
                </Button>
              ) : null}
              <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)} disabled={busy}>
                Eliminar prospecto
              </Button>
            </div>
          </Card>
        </div>
      </div>
      {showDeleteConfirm ? (
        <ConfirmDialog
          title="Eliminar prospecto"
          message={`¿Estás seguro de que quieres eliminar "${prospect.name}"? Se borrarán también su análisis y kit. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={() => {
            setShowDeleteConfirm(false);
            onDelete();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      ) : null}
    </div>
  );
}
