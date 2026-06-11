import { useState } from "react";
import { Button, EmptyState } from "../components/Primitives";
import { theme } from "../app/theme";
import { useIsMobile } from "../hooks/useIsMobile";
import { createRenewal, updateRenewal, deleteRenewal } from "../services/clients";

function fmx(n) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(n || 0);
}

function fdate(d) {
  if (!d) return "—";
  return new Date(d + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 864e5);
}

const RENEWAL_TYPES = [
  { id: "dominio",          label: "Dominio",          icon: "🔗" },
  { id: "hosting",          label: "Hosting",          icon: "🖥" },
  { id: "ssl",              label: "SSL",               icon: "🔒" },
  { id: "google_workspace", label: "Google Workspace",  icon: "📧" },
  { id: "supabase",         label: "Supabase",          icon: "⚡" },
  { id: "vercel",           label: "Vercel",            icon: "▲" },
  { id: "meta",             label: "Meta Business",     icon: "📘" },
  { id: "pasarela",         label: "Pasarela de pago",  icon: "💳" },
  { id: "otro",             label: "Otro",              icon: "📦" }
];

function urgencyColor(days) {
  if (days === null) return theme.muted;
  if (days < 0)  return "#ff4455";
  if (days <= 7)  return "#ff4455";
  if (days <= 15) return "#ffbb44";
  if (days <= 30) return "#4a9eff";
  return theme.muted;
}

function urgencyLabel(days) {
  if (days === null) return "";
  if (days < 0)  return `Vencido hace ${Math.abs(days)}d`;
  if (days === 0) return "Vence hoy";
  if (days <= 30) return `${days}d restantes`;
  return fdate;
}

const inputStyle = { width: "100%", boxSizing: "border-box", background: "#111", border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontSize: 13, padding: "8px 12px", outline: "none" };
const labelSt = { fontSize: 11, color: theme.muted, display: "block", marginBottom: 4 };
function Field({ label, children }) { return <div><label style={labelSt}>{label}</label>{children}</div>; }

export function RenewalsScreen({ renewals, clients, workspaceId, onRenewalsChange }) {
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState("activo");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const emptyForm = { name: "", type: "dominio", provider: "", expires_at: "", cost: "", responsible: "", client_id: "", status: "activo", notes: "" };
  const [form, setForm] = useState(emptyForm);

  const today = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);

  function openNew() { setForm(emptyForm); setEditing(null); setShowForm(true); }
  function openEdit(r) { setForm({ ...r, cost: String(r.cost || "") }); setEditing(r); setShowForm(true); }

  async function handleSave() {
    const payload = { ...form, cost: Number(form.cost) || 0, workspace_id: workspaceId };
    if (editing) {
      const updated = await updateRenewal(workspaceId, { ...editing, ...payload });
      onRenewalsChange("update", updated);
    } else {
      const created = await createRenewal(workspaceId, payload);
      onRenewalsChange("create", created);
    }
    setShowForm(false);
  }

  async function handleDelete(r) {
    if (!confirm(`¿Eliminar "${r.name}"?`)) return;
    await deleteRenewal(workspaceId, r.id);
    onRenewalsChange("delete", r);
  }

  async function markRenewed(r) {
    const updated = await updateRenewal(workspaceId, { ...r, status: "renovado" });
    onRenewalsChange("update", updated);
  }

  const filtered = renewals.filter((r) => filter === "todos" || r.status === filter);
  const upcoming = renewals.filter((r) => r.status === "activo" && r.expires_at && r.expires_at <= in30);

  function clientName(id) { return clients.find((c) => c.id === id)?.name || ""; }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ minHeight: 58, borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 12, padding: isMobile ? "12px 16px" : "0 28px", flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Renovaciones</div>
          <div style={{ fontSize: 11, color: theme.muted }}>{renewals.length} activos · {upcoming.length} próximos 30d</div>
        </div>
        <Button variant="primary" size="sm" onClick={openNew}>+ Agregar</Button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 16 : 24, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Alerts */}
        {upcoming.length > 0 && (
          <div style={{ background: "rgba(74,158,255,0.08)", border: "1px solid rgba(74,158,255,0.25)", borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.blue, marginBottom: 10 }}>⏰ Próximas renovaciones (30 días)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {upcoming.map((r) => {
                const days = daysUntil(r.expires_at);
                const rt = RENEWAL_TYPES.find((t) => t.id === r.type);
                return (
                  <div key={r.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span>{rt?.icon || "📦"}</span>
                    <span style={{ flex: 1, fontSize: 13, color: theme.text }}>{r.name}</span>
                    {r.client_id && <span style={{ fontSize: 11, color: theme.muted }}>{clientName(r.client_id)}</span>}
                    <span style={{ fontSize: 12, fontWeight: 700, color: urgencyColor(days) }}>
                      {days !== null ? (days < 0 ? `Vencido` : `${days}d`) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { id: "todos",    label: "Todos" },
            { id: "activo",   label: "Activos" },
            { id: "renovado", label: "Renovados" },
            { id: "cancelado",label: "Cancelados" }
          ].map((s) => (
            <button key={s.id} onClick={() => setFilter(s.id)} style={{
              fontSize: 11, padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontWeight: 600, border: "none",
              background: filter === s.id ? theme.accent : theme.s2,
              color: filter === s.id ? "#000" : theme.muted
            }}>{s.label}</button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState title="Sin renovaciones" description="Registra dominios, hosting, SSL y otros activos digitales para recibir alertas antes de que venzan." actions={<Button variant="primary" onClick={openNew}>+ Agregar renovación</Button>} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((r) => {
              const rt = RENEWAL_TYPES.find((t) => t.id === r.type);
              const days = daysUntil(r.expires_at);
              const uc = urgencyColor(days);
              return (
                <div key={r.id} style={{ background: theme.s2, border: `1px solid ${days !== null && days <= 7 ? "rgba(255,68,85,0.3)" : days !== null && days <= 30 ? "rgba(255,187,68,0.2)" : theme.border}`, borderRadius: 12, padding: "14px 18px" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>{rt?.icon || "📦"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: theme.muted }}>
                        {rt?.label || r.type}
                        {r.provider && ` · ${r.provider}`}
                        {r.client_id && ` · ${clientName(r.client_id)}`}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: uc }}>
                        {days !== null ? (days < 0 ? `Vencido ${Math.abs(days)}d` : days === 0 ? "Hoy" : `${days}d`) : "—"}
                      </div>
                      <div style={{ fontSize: 10, color: theme.muted }}>{fdate(r.expires_at)}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    {r.cost > 0 && <span style={{ fontSize: 12, color: theme.muted }}>{fmx(r.cost)}</span>}
                    {r.responsible && <span style={{ fontSize: 12, color: theme.muted }}>👤 {r.responsible}</span>}
                    <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                      {r.status === "activo" && <Button size="sm" variant="accent" onClick={() => markRenewed(r)}>✓ Renovado</Button>}
                      <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>Editar</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(r)}>✕</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24, width: "min(500px,100%)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 18 }}>{editing ? "Editar renovación" : "Nueva renovación"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Nombre">
                  <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: negocio.com" autoFocus />
                </Field>
                <Field label="Tipo">
                  <select style={inputStyle} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                    {RENEWAL_TYPES.map((t) => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
                  </select>
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Proveedor">
                  <input style={inputStyle} value={form.provider} onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))} placeholder="GoDaddy, Hostinger..." />
                </Field>
                <Field label="Fecha vencimiento">
                  <input style={inputStyle} type="date" value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))} />
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Costo (MXN)">
                  <input style={inputStyle} type="number" value={form.cost} onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))} placeholder="0" />
                </Field>
                <Field label="Responsable">
                  <input style={inputStyle} value={form.responsible} onChange={(e) => setForm((f) => ({ ...f, responsible: e.target.value }))} placeholder="Carlos Ramos" />
                </Field>
              </div>
              <Field label="Cliente (opcional)">
                <select style={inputStyle} value={form.client_id} onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}>
                  <option value="">— Sin asignar —</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Notas">
                <input style={inputStyle} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </Field>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                <Button size="sm" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button size="sm" variant="primary" onClick={handleSave} disabled={!form.name.trim() || !form.expires_at}>Guardar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
