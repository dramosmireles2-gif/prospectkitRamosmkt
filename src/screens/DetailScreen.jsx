import { useState } from "react";
import { Badge, Button, Card, ConfirmDialog, EmptyState, Field } from "../components/Primitives";
import { theme } from "../app/theme";
import { formatDateLabel, formatRelativeTime } from "../utils/format";

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

export function DetailScreen({ prospect, onOpenView, onGenerateAnalysis, onRegenerateAnalysis, onGenerateKit, onMarkContacted, onDelete, onUpdateNotes, busy }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [draftNotes, setDraftNotes] = useState("");

  if (!prospect) {
    return <EmptyState title="Selecciona un prospecto" description="Abre un prospecto desde el dashboard o el listado para revisar su ficha." />;
  }

  const scoreColor = prospect.opportunityScore >= 85 ? theme.accent : prospect.opportunityScore >= 70 ? theme.yellow : theme.blue;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div
        style={{
          height: 58,
          borderBottom: `1px solid ${theme.border}`,
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
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

      <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${theme.s2} 0%, rgba(0,255,136,0.03) 100%)`,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: "22px 26px",
            display: "flex",
            alignItems: "center",
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
              <span style={{ fontSize: 12, color: theme.muted }}>{prospect.industry}</span>
              <span style={{ fontSize: 12, color: theme.dim }}>·</span>
              <span style={{ fontSize: 12, color: theme.muted }}>{prospect.city}</span>
              <span style={{ fontSize: 12, color: theme.dim }}>·</span>
              <span style={{ fontSize: 12, color: theme.muted }}>{formatDateLabel(prospect.createdAt)}</span>
            </div>
          </div>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: scoreColor, letterSpacing: "-0.03em", lineHeight: 1 }}>{prospect.opportunityScore}</div>
            <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>Score</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
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
