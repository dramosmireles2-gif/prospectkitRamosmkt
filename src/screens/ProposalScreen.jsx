import { useState } from "react";
import { Button, Card, EmptyState } from "../components/Primitives";
import { theme } from "../app/theme";
import { formatCurrency } from "../utils/format";

const CATALOG = [
  { id: "web",       service: "Landing Page",            icon: "🌐", price: 3500 },
  { id: "gmb",       service: "Google My Business",       icon: "📍", price: 800  },
  { id: "ads",       service: "Meta Ads locales",         icon: "📣", price: 2200 },
  { id: "social",    service: "Contenido orgánico",       icon: "✨", price: 1500 },
  { id: "whatsapp",  service: "WhatsApp Business",        icon: "💬", price: 900  },
  { id: "ecom",      service: "Catálogo / tienda online", icon: "🛒", price: 1800 },
  { id: "seo",       service: "SEO local",                icon: "🔍", price: 1200 },
  { id: "email",     service: "Email marketing",          icon: "✉️", price: 1000 }
];

const STATUS_CONFIG = {
  borrador:    { label: "Borrador",       color: theme.muted,  bg: "rgba(255,255,255,0.06)" },
  enviada:     { label: "Enviada",        color: theme.blue,   bg: "rgba(74,158,255,0.12)"  },
  negociacion: { label: "En negociación", color: theme.yellow, bg: "rgba(255,187,68,0.12)"  },
  aceptada:    { label: "Aceptada ✓",    color: theme.accent, bg: "rgba(0,255,136,0.12)"   },
  rechazada:   { label: "Rechazada",      color: theme.red,    bg: "rgba(255,68,85,0.12)"   }
};

function emptyDraft() {
  return { status: "borrador", services: [], notes: "", sent_at: "" };
}

function draftFromProposal(p) {
  return {
    status: p.status,
    services: p.services.map((s) => ({ ...s })),
    notes: p.notes || "",
    sent_at: p.sentAt || ""
  };
}

function ServiceRow({ svc, onPriceChange, onRemove }) {
  const discount = svc.originalPrice > 0
    ? Math.round(((svc.originalPrice - svc.negotiatedPrice) / svc.originalPrice) * 100)
    : 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: theme.s3, borderRadius: 10, border: `1px solid ${theme.border}` }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{svc.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{svc.service}</div>
        <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>Precio catálogo: {formatCurrency(svc.originalPrice)}</div>
      </div>

      {/* Negotiated price input */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: theme.muted }}>$</span>
        <input
          type="number"
          value={svc.negotiatedPrice}
          min={0}
          onChange={(e) => onPriceChange(svc.id, Math.max(0, parseInt(e.target.value) || 0))}
          style={{
            width: 90, background: theme.s2, border: `1px solid ${theme.border}`,
            borderRadius: 7, padding: "6px 10px", color: theme.text, fontSize: 13,
            fontWeight: 700, outline: "none", textAlign: "right"
          }}
        />
        <span style={{ fontSize: 11, color: theme.muted }}>/mo</span>
      </div>

      {/* Discount badge */}
      {discount > 0 ? (
        <div style={{ padding: "3px 8px", borderRadius: 6, background: "rgba(255,187,68,0.12)", border: "1px solid rgba(255,187,68,0.3)", fontSize: 11, fontWeight: 700, color: theme.yellow, flexShrink: 0 }}>
          −{discount}%
        </div>
      ) : discount < 0 ? (
        <div style={{ padding: "3px 8px", borderRadius: 6, background: "rgba(0,255,136,0.1)", border: `1px solid ${theme.accentBorder}`, fontSize: 11, fontWeight: 700, color: theme.accent, flexShrink: 0 }}>
          +{Math.abs(discount)}%
        </div>
      ) : (
        <div style={{ width: 44, flexShrink: 0 }} />
      )}

      <button
        onClick={() => onRemove(svc.id)}
        style={{ background: "transparent", border: "none", color: theme.dim, cursor: "pointer", fontSize: 16, padding: "2px 4px", flexShrink: 0 }}
      >
        ×
      </button>
    </div>
  );
}

function VersionBadge({ version, status, date, isActive, onClick }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.borrador;
  return (
    <div
      onClick={onClick}
      style={{
        padding: "10px 14px", borderRadius: 9, cursor: "pointer",
        background: isActive ? theme.accentBg : "rgba(255,255,255,0.03)",
        border: `1px solid ${isActive ? theme.accentBorder : theme.border}`
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? theme.accent : theme.text }}>v{version}</div>
      <div style={{ display: "inline-block", marginTop: 4, padding: "2px 7px", borderRadius: 5, background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 600 }}>{cfg.label}</div>
      {date ? <div style={{ fontSize: 10, color: theme.dim, marginTop: 4 }}>{date}</div> : null}
    </div>
  );
}

export function ProposalScreen({ prospect, proposals, onSave, onBack, saving }) {
  const sorted = [...(proposals || [])].sort((a, b) => b.version - a.version);
  const latest = sorted[0] || null;

  const [activeVersionId, setActiveVersionId] = useState(latest?.id || null);
  const [draft, setDraft] = useState(latest ? draftFromProposal(latest) : emptyDraft());
  const [addingService, setAddingService] = useState(false);

  if (!prospect) {
    return <EmptyState title="Selecciona un prospecto" description="La propuesta se vincula a un prospecto activo." />;
  }

  function selectVersion(p) {
    setActiveVersionId(p.id);
    setDraft(draftFromProposal(p));
  }

  function addService(catalogItem) {
    if (draft.services.find((s) => s.id === catalogItem.id)) return;
    setDraft((d) => ({
      ...d,
      services: [...d.services, { id: catalogItem.id, service: catalogItem.service, icon: catalogItem.icon, originalPrice: catalogItem.price, negotiatedPrice: catalogItem.price }]
    }));
    setAddingService(false);
  }

  function updatePrice(serviceId, price) {
    setDraft((d) => ({ ...d, services: d.services.map((s) => s.id === serviceId ? { ...s, negotiatedPrice: price } : s) }));
  }

  function removeService(serviceId) {
    setDraft((d) => ({ ...d, services: d.services.filter((s) => s.id !== serviceId) }));
  }

  const totalOriginal    = draft.services.reduce((sum, s) => sum + s.originalPrice, 0);
  const totalNegotiated  = draft.services.reduce((sum, s) => sum + s.negotiatedPrice, 0);
  const totalDiscount    = totalOriginal > 0 ? Math.round(((totalOriginal - totalNegotiated) / totalOriginal) * 100) : 0;
  const isNewVersion     = !latest || activeVersionId === null;
  const isDirty          = JSON.stringify(draft) !== JSON.stringify(latest ? draftFromProposal(latest) : emptyDraft());
  const availableCatalog = CATALOG.filter((c) => !draft.services.find((s) => s.id === c.id));

  function handleSave(asNewVersion) {
    onSave({
      version: asNewVersion ? (latest?.version || 0) + 1 : (sorted.find((p) => p.id === activeVersionId)?.version || 1),
      status: draft.status,
      services: draft.services,
      totalOriginal,
      totalNegotiated,
      notes: draft.notes,
      sentAt: draft.sent_at || null,
      isNewVersion: asNewVersion
    });
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ height: 58, borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", padding: "0 28px", gap: 16, background: theme.bg, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.dim, marginBottom: 2, letterSpacing: "0.04em" }}>{prospect.name}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Propuesta activa</div>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>← Volver</Button>
      </div>

      <div style={{ flex: 1, overflow: "hidden", display: "grid", gridTemplateColumns: "180px 1fr" }}>
        {/* Version sidebar */}
        <div style={{ borderRight: `1px solid ${theme.border}`, padding: 14, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 10, color: theme.dim, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 4 }}>Versiones</div>
          <div
            onClick={() => { setActiveVersionId(null); setDraft(emptyDraft()); }}
            style={{ padding: "10px 14px", borderRadius: 9, cursor: "pointer", background: activeVersionId === null ? theme.accentBg : "rgba(255,255,255,0.03)", border: `1px solid ${activeVersionId === null ? theme.accentBorder : theme.border}` }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: activeVersionId === null ? theme.accent : theme.text }}>+ Nueva</div>
            <div style={{ fontSize: 10, color: theme.muted, marginTop: 2 }}>v{(latest?.version || 0) + 1}</div>
          </div>
          {sorted.map((p) => (
            <VersionBadge key={p.id} version={p.version} status={p.status} date={p.sentAt} isActive={activeVersionId === p.id} onClick={() => selectVersion(p)} />
          ))}
          {sorted.length === 0 && (
            <div style={{ fontSize: 11, color: theme.dim, lineHeight: 1.5 }}>Aún no hay propuestas guardadas.</div>
          )}
        </div>

        {/* Editor */}
        <div style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Status + totals */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: theme.muted, marginBottom: 6 }}>Estado</div>
              <select
                value={draft.status}
                onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
                style={{ width: "100%", background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "8px 12px", color: theme.text, fontSize: 13, outline: "none" }}
              >
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "10px 16px" }}>
              <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Total mensual</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: theme.accent, marginTop: 4 }}>{formatCurrency(totalNegotiated)}</div>
              {totalDiscount > 0 && <div style={{ fontSize: 10, color: theme.yellow, marginTop: 2 }}>Catálogo: {formatCurrency(totalOriginal)} (−{totalDiscount}%)</div>}
              {totalDiscount < 0 && <div style={{ fontSize: 10, color: theme.accent, marginTop: 2 }}>Catálogo: {formatCurrency(totalOriginal)} (+{Math.abs(totalDiscount)}%)</div>}
            </div>
            <div style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "10px 16px" }}>
              <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Anual proyectado</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: theme.yellow, marginTop: 4 }}>{formatCurrency(totalNegotiated * 12)}</div>
              <div style={{ fontSize: 10, color: theme.muted, marginTop: 2 }}>{draft.services.length} servicio{draft.services.length !== 1 ? "s" : ""}</div>
            </div>
          </div>

          {/* Services */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>Servicios ofrecidos</div>
              {availableCatalog.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setAddingService((v) => !v)}>
                  {addingService ? "Cancelar" : "+ Agregar servicio"}
                </Button>
              )}
            </div>

            {addingService && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, padding: 14, background: theme.s2, borderRadius: 10, border: `1px solid ${theme.border}` }}>
                {availableCatalog.map((c) => (
                  <button key={c.id} onClick={() => addService(c)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, background: theme.s3, border: `1px solid ${theme.border}`, color: theme.text, fontSize: 12, cursor: "pointer" }}>
                    <span>{c.icon}</span>{c.service}<span style={{ color: theme.muted, fontSize: 11 }}>{formatCurrency(c.price)}</span>
                  </button>
                ))}
              </div>
            )}

            {draft.services.length === 0 ? (
              <div style={{ padding: "32px 0", textAlign: "center", color: theme.dim, fontSize: 13 }}>
                Agrega servicios desde el catálogo para armar la propuesta.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {draft.services.map((s) => (
                  <ServiceRow key={s.id} svc={s} onPriceChange={updatePrice} onRemove={removeService} />
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>Notas de negociación</div>
            <textarea
              value={draft.notes}
              onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              placeholder="¿Qué se negoció? ¿Qué pidió el cliente? ¿Qué compromisos quedan pendientes?"
              rows={4}
              style={{ width: "100%", background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 9, padding: "12px 14px", color: theme.text, fontSize: 13, lineHeight: 1.65, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            />
          </div>

          {/* Save actions */}
          <div style={{ display: "flex", gap: 10, paddingBottom: 8 }}>
            {activeVersionId !== null && isDirty && (
              <Button variant="secondary" onClick={() => handleSave(false)} disabled={saving || draft.services.length === 0}>
                {saving ? "Guardando..." : "Actualizar v" + (sorted.find((p) => p.id === activeVersionId)?.version || "")}
              </Button>
            )}
            <Button variant="primary" onClick={() => handleSave(true)} disabled={saving || draft.services.length === 0}>
              {saving ? "Guardando..." : activeVersionId === null ? "Crear propuesta" : `Guardar como v${(latest?.version || 0) + 1}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
