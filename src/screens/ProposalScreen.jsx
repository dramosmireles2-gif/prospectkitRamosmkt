import { useState } from "react";
import { Button, Card, EmptyState } from "../components/Primitives";
import { theme } from "../app/theme";
import { formatCurrency } from "../utils/format";

// type: "unico" | "mensual" | "setup+mensual"
// price = pago único o mensual; setupPrice = cargo inicial cuando type === "setup+mensual"
const CATALOG = [
  { id: "web",      service: "Landing Page / Sitio web",   icon: "🌐", type: "unico",         price: 3500 },
  { id: "ecom",     service: "Catálogo / Tienda online",   icon: "🛒", type: "setup+mensual", price: 800,  setupPrice: 4500 },
  { id: "gmb",      service: "Google My Business",         icon: "📍", type: "mensual",        price: 800  },
  { id: "ads",      service: "Meta Ads locales",           icon: "📣", type: "mensual",        price: 2200 },
  { id: "social",   service: "Contenido orgánico",         icon: "✨", type: "mensual",        price: 1500 },
  { id: "whatsapp", service: "WhatsApp Business",          icon: "💬", type: "mensual",        price: 900  },
  { id: "seo",      service: "SEO local",                  icon: "🔍", type: "mensual",        price: 1200 },
  { id: "email",    service: "Email marketing",            icon: "✉️", type: "mensual",        price: 1000 },
  { id: "hosting",  service: "Dominio + Hosting",          icon: "☁️", type: "mensual",        price: 350  },
  { id: "manten",   service: "Mantenimiento web",          icon: "🔧", type: "mensual",        price: 600  }
];

const TYPE_LABEL = {
  unico:         { label: "Pago único",    color: theme.blue,   bg: "rgba(74,158,255,0.10)"  },
  mensual:       { label: "Mensual",       color: theme.accent, bg: "rgba(0,255,136,0.09)"   },
  "setup+mensual": { label: "Setup + mensual", color: theme.yellow, bg: "rgba(255,187,68,0.10)" }
};

const STATUS_CONFIG = {
  borrador:    { label: "Borrador",       color: theme.muted,  bg: "rgba(255,255,255,0.06)" },
  enviada:     { label: "Enviada",        color: theme.blue,   bg: "rgba(74,158,255,0.12)"  },
  negociacion: { label: "En negociación", color: theme.yellow, bg: "rgba(255,187,68,0.12)"  },
  aceptada:    { label: "Aceptada ✓",    color: theme.accent, bg: "rgba(0,255,136,0.12)"   },
  rechazada:   { label: "Rechazada",      color: theme.red,    bg: "rgba(255,68,85,0.12)"   }
};

// Map analysis recommended service names to catalog IDs
const SERVICE_KEYWORDS = {
  web:      ["landing", "sitio", "página", "web"],
  ecom:     ["tienda", "catálogo", "ecommerce", "e-commerce"],
  gmb:      ["google", "maps", "gmb", "business"],
  ads:      ["ads", "meta", "facebook", "pauta", "publicidad"],
  social:   ["social", "orgánico", "contenido", "redes"],
  whatsapp: ["whatsapp", "whats"],
  seo:      ["seo", "posicionamiento", "búsqueda"],
  email:    ["email", "correo", "newsletter"]
};

function matchCatalogItem(serviceLabel) {
  const lower = serviceLabel.toLowerCase();
  for (const [id, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return CATALOG.find((c) => c.id === id) || null;
    }
  }
  return null;
}

function draftFromAnalysis(analysis) {
  const services = [];
  for (const rec of analysis.recommendedServices || []) {
    const cat = matchCatalogItem(rec.service);
    if (!cat || services.find((s) => s.id === cat.id)) continue;
    services.push({
      id: cat.id,
      service: cat.service,
      icon: cat.icon,
      type: cat.type,
      originalPrice: cat.price,
      negotiatedPrice: cat.price,
      ...(cat.type === "setup+mensual" ? { originalSetupPrice: cat.setupPrice, negotiatedSetupPrice: cat.setupPrice } : {})
    });
  }
  return { status: "borrador", services, notes: "", sent_at: "" };
}

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

function ServiceRow({ svc, onPriceChange, onSetupPriceChange, onRemove }) {
  const typeCfg = TYPE_LABEL[svc.type] || TYPE_LABEL.mensual;
  const isSetup = svc.type === "setup+mensual";
  const isUnico = svc.type === "unico";

  const discountMonthly = svc.originalPrice > 0
    ? Math.round(((svc.originalPrice - svc.negotiatedPrice) / svc.originalPrice) * 100)
    : 0;
  const discountSetup = isSetup && svc.originalSetupPrice > 0
    ? Math.round(((svc.originalSetupPrice - svc.negotiatedSetupPrice) / svc.originalSetupPrice) * 100)
    : 0;

  return (
    <div style={{ background: theme.s3, borderRadius: 10, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px" }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>{svc.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{svc.service}</div>
          <span style={{ display: "inline-block", marginTop: 3, padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, color: typeCfg.color, background: typeCfg.bg }}>
            {typeCfg.label}
          </span>
        </div>
        <button
          onClick={() => onRemove(svc.id)}
          style={{ background: "transparent", border: "none", color: theme.dim, cursor: "pointer", fontSize: 16, padding: "2px 6px", flexShrink: 0 }}
        >×</button>
      </div>

      {/* Price rows */}
      <div style={{ borderTop: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Setup price row (setup+mensual only) */}
        {isSetup && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: `1px solid ${theme.border}` }}>
            <div style={{ fontSize: 11, color: theme.muted, width: 90, flexShrink: 0 }}>Setup inicial</div>
            <div style={{ fontSize: 11, color: theme.dim, flex: 1 }}>Catálogo: {formatCurrency(svc.originalSetupPrice)}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: theme.muted }}>$</span>
              <input
                type="number" value={svc.negotiatedSetupPrice} min={0}
                onChange={(e) => onSetupPriceChange(svc.id, Math.max(0, parseInt(e.target.value) || 0))}
                style={{ width: 90, background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 7, padding: "5px 10px", color: theme.text, fontSize: 13, fontWeight: 700, outline: "none", textAlign: "right" }}
              />
            </div>
            {discountSetup !== 0 && (
              <div style={{ padding: "3px 8px", borderRadius: 6, background: discountSetup > 0 ? "rgba(255,187,68,0.12)" : "rgba(0,255,136,0.1)", border: `1px solid ${discountSetup > 0 ? "rgba(255,187,68,0.3)" : theme.accentBorder}`, fontSize: 11, fontWeight: 700, color: discountSetup > 0 ? theme.yellow : theme.accent, flexShrink: 0 }}>
                {discountSetup > 0 ? `−${discountSetup}%` : `+${Math.abs(discountSetup)}%`}
              </div>
            )}
            {discountSetup === 0 && <div style={{ width: 52, flexShrink: 0 }} />}
          </div>
        )}

        {/* Monthly / one-time price row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px" }}>
          <div style={{ fontSize: 11, color: theme.muted, width: 90, flexShrink: 0 }}>
            {isUnico ? "Pago único" : isSetup ? "Mensual" : "Mensual"}
          </div>
          <div style={{ fontSize: 11, color: theme.dim, flex: 1 }}>Catálogo: {formatCurrency(svc.originalPrice)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: theme.muted }}>$</span>
            <input
              type="number" value={svc.negotiatedPrice} min={0}
              onChange={(e) => onPriceChange(svc.id, Math.max(0, parseInt(e.target.value) || 0))}
              style={{ width: 90, background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 7, padding: "5px 10px", color: theme.text, fontSize: 13, fontWeight: 700, outline: "none", textAlign: "right" }}
            />
            {!isUnico && <span style={{ fontSize: 11, color: theme.muted }}>/mo</span>}
          </div>
          {discountMonthly !== 0 && (
            <div style={{ padding: "3px 8px", borderRadius: 6, background: discountMonthly > 0 ? "rgba(255,187,68,0.12)" : "rgba(0,255,136,0.1)", border: `1px solid ${discountMonthly > 0 ? "rgba(255,187,68,0.3)" : theme.accentBorder}`, fontSize: 11, fontWeight: 700, color: discountMonthly > 0 ? theme.yellow : theme.accent, flexShrink: 0 }}>
              {discountMonthly > 0 ? `−${discountMonthly}%` : `+${Math.abs(discountMonthly)}%`}
            </div>
          )}
          {discountMonthly === 0 && <div style={{ width: 52, flexShrink: 0 }} />}
        </div>
      </div>
    </div>
  );
}

function VersionBadge({ version, status, date, isActive, onClick }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.borrador;
  return (
    <div
      onClick={onClick}
      style={{ padding: "10px 14px", borderRadius: 9, cursor: "pointer", background: isActive ? theme.accentBg : "rgba(255,255,255,0.03)", border: `1px solid ${isActive ? theme.accentBorder : theme.border}` }}
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
  const initialDraft = latest ? draftFromProposal(latest) : (prospect?.analysis ? draftFromAnalysis(prospect.analysis) : emptyDraft());
  const [draft, setDraft] = useState(initialDraft);
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
    const svc = {
      id: catalogItem.id,
      service: catalogItem.service,
      icon: catalogItem.icon,
      type: catalogItem.type,
      originalPrice: catalogItem.price,
      negotiatedPrice: catalogItem.price,
      ...(catalogItem.type === "setup+mensual" ? {
        originalSetupPrice: catalogItem.setupPrice,
        negotiatedSetupPrice: catalogItem.setupPrice
      } : {})
    };
    setDraft((d) => ({ ...d, services: [...d.services, svc] }));
    setAddingService(false);
  }

  function updatePrice(serviceId, price) {
    setDraft((d) => ({ ...d, services: d.services.map((s) => s.id === serviceId ? { ...s, negotiatedPrice: price } : s) }));
  }

  function updateSetupPrice(serviceId, price) {
    setDraft((d) => ({ ...d, services: d.services.map((s) => s.id === serviceId ? { ...s, negotiatedSetupPrice: price } : s) }));
  }

  function removeService(serviceId) {
    setDraft((d) => ({ ...d, services: d.services.filter((s) => s.id !== serviceId) }));
  }

  // Totals split by type
  const inicialServices  = draft.services.filter((s) => s.type === "unico" || s.type === "setup+mensual");
  const mensualServices  = draft.services.filter((s) => s.type === "mensual" || s.type === "setup+mensual");

  const totalInicial     = inicialServices.reduce((sum, s) => {
    if (s.type === "unico") return sum + s.negotiatedPrice;
    return sum + (s.negotiatedSetupPrice || 0);
  }, 0);
  const totalMensual     = mensualServices.reduce((sum, s) => sum + s.negotiatedPrice, 0);
  const totalAnual       = totalInicial + totalMensual * 12;

  const catInicial       = inicialServices.reduce((sum, s) => {
    if (s.type === "unico") return sum + s.originalPrice;
    return sum + (s.originalSetupPrice || 0);
  }, 0);
  const catMensual       = mensualServices.reduce((sum, s) => sum + s.originalPrice, 0);

  const discInicial      = catInicial > 0 ? Math.round(((catInicial - totalInicial) / catInicial) * 100) : 0;
  const discMensual      = catMensual > 0 ? Math.round(((catMensual - totalMensual) / catMensual) * 100) : 0;

  const isNewVersion     = !latest || activeVersionId === null;
  const isDirty          = JSON.stringify(draft) !== JSON.stringify(latest ? draftFromProposal(latest) : emptyDraft());
  const availableCatalog = CATALOG.filter((c) => !draft.services.find((s) => s.id === c.id));

  function handleSave(asNewVersion) {
    onSave({
      version: asNewVersion ? (latest?.version || 0) + 1 : (sorted.find((p) => p.id === activeVersionId)?.version || 1),
      status: draft.status,
      services: draft.services,
      totalOriginal: catMensual,
      totalNegotiated: totalMensual,
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
            onClick={() => { setActiveVersionId(null); setDraft(prospect?.analysis ? draftFromAnalysis(prospect.analysis) : emptyDraft()); }}
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

          {/* Status */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 11, color: theme.muted, flexShrink: 0 }}>Estado:</div>
            <select
              value={draft.status}
              onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
              style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "7px 12px", color: theme.text, fontSize: 13, outline: "none" }}
            >
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>

          {/* Totals */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {/* Pago inicial */}
            <div style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Pago inicial</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: theme.blue }}>{formatCurrency(totalInicial)}</div>
              {discInicial > 0 && <div style={{ fontSize: 10, color: theme.yellow, marginTop: 3 }}>Catálogo: {formatCurrency(catInicial)} (−{discInicial}%)</div>}
              {discInicial < 0 && <div style={{ fontSize: 10, color: theme.accent, marginTop: 3 }}>Catálogo: {formatCurrency(catInicial)} (+{Math.abs(discInicial)}%)</div>}
              {discInicial === 0 && catInicial > 0 && <div style={{ fontSize: 10, color: theme.dim, marginTop: 3 }}>Sin descuento</div>}
              {catInicial === 0 && <div style={{ fontSize: 10, color: theme.dim, marginTop: 3 }}>Sin pagos únicos</div>}
            </div>

            {/* Mensual recurrente */}
            <div style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Mensual recurrente</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: theme.accent }}>{formatCurrency(totalMensual)}</div>
              {discMensual > 0 && <div style={{ fontSize: 10, color: theme.yellow, marginTop: 3 }}>Catálogo: {formatCurrency(catMensual)} (−{discMensual}%)</div>}
              {discMensual < 0 && <div style={{ fontSize: 10, color: theme.accent, marginTop: 3 }}>Catálogo: {formatCurrency(catMensual)} (+{Math.abs(discMensual)}%)</div>}
              {discMensual === 0 && catMensual > 0 && <div style={{ fontSize: 10, color: theme.dim, marginTop: 3 }}>Sin descuento</div>}
              {catMensual === 0 && <div style={{ fontSize: 10, color: theme.dim, marginTop: 3 }}>Solo pagos únicos</div>}
            </div>

            {/* Anual proyectado */}
            <div style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Anual proyectado</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: theme.yellow }}>{formatCurrency(totalAnual)}</div>
              <div style={{ fontSize: 10, color: theme.dim, marginTop: 3 }}>Inicial + {draft.services.length > 0 ? "12 meses" : "—"}</div>
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
                {availableCatalog.map((c) => {
                  const typeCfg = TYPE_LABEL[c.type] || TYPE_LABEL.mensual;
                  return (
                    <button key={c.id} onClick={() => addService(c)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, background: theme.s3, border: `1px solid ${theme.border}`, color: theme.text, fontSize: 12, cursor: "pointer" }}>
                      <span>{c.icon}</span>
                      {c.service}
                      <span style={{ padding: "1px 6px", borderRadius: 10, fontSize: 10, fontWeight: 600, color: typeCfg.color, background: typeCfg.bg }}>{typeCfg.label}</span>
                      <span style={{ color: theme.muted, fontSize: 11 }}>
                        {c.type === "setup+mensual" ? `${formatCurrency(c.setupPrice)} + ${formatCurrency(c.price)}/mo` : c.type === "unico" ? formatCurrency(c.price) : `${formatCurrency(c.price)}/mo`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {draft.services.length === 0 ? (
              <div style={{ padding: "32px 0", textAlign: "center", color: theme.dim, fontSize: 13 }}>
                Agrega servicios desde el catálogo para armar la propuesta.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {draft.services.map((s) => (
                  <ServiceRow key={s.id} svc={s} onPriceChange={updatePrice} onSetupPriceChange={updateSetupPrice} onRemove={removeService} />
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
