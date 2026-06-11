import { useState } from "react";
import { Button, EmptyState } from "../components/Primitives";
import { theme } from "../app/theme";
import { useIsMobile } from "../hooks/useIsMobile";
import { createClient } from "../services/clients";

const CLIENT_STATUS = [
  { id: "activo",  label: "Activo",  color: "#00ff88" },
  { id: "pausado", label: "Pausado", color: "#ffbb44" },
  { id: "perdido", label: "Perdido", color: "#ff4455" }
];

export const PROJECT_STAGES = [
  { id: "inicio",        label: "Inicio",        color: "#777777" },
  { id: "desarrollo",    label: "Desarrollo",    color: "#4a9eff" },
  { id: "revision",      label: "Revisión",      color: "#9966ff" },
  { id: "entregado",     label: "Entregado",     color: "#ffbb44" },
  { id: "mantenimiento", label: "Mantenimiento", color: "#00ff88" }
];

function statusColor(s) {
  return CLIENT_STATUS.find((x) => x.id === s)?.color || "#777";
}

function ClientCard({ client, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onClick(client)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? theme.s3 : theme.s2,
        border: `1px solid ${hovered ? theme.borderStrong : theme.border}`,
        borderRadius: 12,
        padding: "16px 18px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        display: "flex",
        flexDirection: "column",
        gap: 10
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {client.name}
          </div>
          {client.contact_name && (
            <div style={{ fontSize: 12, color: theme.muted }}>{client.contact_name}</div>
          )}
        </div>
        <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: statusColor(client.status), background: `${statusColor(client.status)}18`, padding: "3px 10px", borderRadius: 20 }}>
          {CLIENT_STATUS.find((s) => s.id === client.status)?.label || client.status}
        </span>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {client.city && <span style={{ fontSize: 11, color: theme.muted }}>📍 {client.city}</span>}
        {client.whatsapp && <span style={{ fontSize: 11, color: theme.muted }}>💬 {client.whatsapp}</span>}
        {client.website_url && <span style={{ fontSize: 11, color: theme.blue }}>🌐 Web</span>}
        {client.github_url && <span style={{ fontSize: 11, color: theme.muted }}>🐙 GitHub</span>}
      </div>
      {client.project_stage && (() => {
        const ps = PROJECT_STAGES.find((s) => s.id === client.project_stage);
        if (!ps) return null;
        const idx = PROJECT_STAGES.findIndex((s) => s.id === client.project_stage);
        return (
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            {PROJECT_STAGES.map((s, i) => (
              <div key={s.id} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= idx ? ps.color : theme.s3, transition: "background 0.2s" }} />
            ))}
            <span style={{ fontSize: 10, color: ps.color, fontWeight: 700, marginLeft: 6, flexShrink: 0 }}>{ps.label}</span>
          </div>
        );
      })()}
      <div style={{ fontSize: 10, color: theme.dim }}>
        Cliente desde {new Date(client.started_at + "T12:00:00").toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" })}
      </div>
    </div>
  );
}

function NewClientModal({ workspaceId, onCreated, onClose }) {
  const [form, setForm] = useState({
    name: "", contact_name: "", whatsapp: "", email: "", city: "",
    project_stage: "inicio", github_url: "", notes: ""
  });
  const [busy, setBusy] = useState(false);

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      const client = await createClient(workspaceId, form);
      onCreated(client);
    } finally {
      setBusy(false);
    }
  }

  const ist = { width: "100%", boxSizing: "border-box", background: theme.s1, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontSize: 13, padding: "9px 12px", outline: "none" };
  const lst = { fontSize: 11, color: theme.muted, display: "block", marginBottom: 4 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 28, width: "min(480px,100%)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Nuevo cliente</div>
        <div style={{ fontSize: 12, color: theme.muted, marginBottom: 20 }}>Solo necesitas el nombre para empezar. Puedes agregar el resto después.</div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={lst}>Nombre del negocio *</label>
            <input style={ist} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ej: Carlos García / Restaurante El Rincón" autoFocus required />
          </div>
          <div>
            <label style={lst}>WhatsApp</label>
            <input style={ist} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+52 899 123 4567" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lst}>Contacto</label>
              <input style={ist} value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} placeholder="Nombre del dueño" />
            </div>
            <div>
              <label style={lst}>Ciudad</label>
              <input style={ist} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Reynosa" />
            </div>
          </div>
          <div>
            <label style={lst}>Etapa del proyecto</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PROJECT_STAGES.map((s) => (
                <button key={s.id} type="button" onClick={() => set("project_stage", s.id)} style={{
                  fontSize: 11, padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontWeight: 600, border: "none",
                  background: form.project_stage === s.id ? s.color : theme.s1,
                  color: form.project_stage === s.id ? "#000" : theme.muted
                }}>{s.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={lst}>🐙 Repo GitHub (opcional)</label>
            <input style={ist} value={form.github_url} onChange={(e) => set("github_url", e.target.value)} placeholder="https://github.com/usuario/proyecto" />
          </div>
          <div>
            <label style={lst}>Notas</label>
            <textarea style={{ ...ist, resize: "vertical", minHeight: 60 }} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Lo que sabes del proyecto..." />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
            <Button variant="secondary" size="sm" onClick={onClose} type="button">Cancelar</Button>
            <Button variant="primary" size="sm" type="submit" disabled={busy || !form.name.trim()}>
              {busy ? "Guardando..." : "Crear cliente"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ClientsScreen({ clients, workspaceId, onSelectClient, onClientCreated }) {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [showModal, setShowModal] = useState(false);

  const filtered = clients.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.contact_name || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "todos" || c.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        minHeight: 58, borderBottom: `1px solid ${theme.border}`,
        display: "flex", alignItems: "center", gap: 12,
        padding: isMobile ? "12px 16px" : "0 28px", flexShrink: 0, flexWrap: "wrap"
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Clientes</div>
          <div style={{ fontSize: 11, color: theme.muted }}>{clients.length} registrados</div>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>+ Nuevo cliente</Button>
      </div>

      {/* Filters */}
      <div style={{ padding: isMobile ? "12px 16px" : "12px 28px", display: "flex", gap: 10, flexWrap: "wrap", borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente..."
          style={{ flex: 1, minWidth: 160, background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontSize: 13, padding: "7px 12px", outline: "none" }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {[{ id: "todos", label: "Todos" }, ...CLIENT_STATUS].map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              style={{
                fontSize: 11, padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontWeight: 600, border: "none",
                background: filter === s.id ? theme.accent : theme.s2,
                color: filter === s.id ? "#000" : theme.muted
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 16 : "20px 28px" }}>
        {filtered.length === 0 ? (
          <EmptyState
            title={clients.length === 0 ? "Sin clientes aún" : "Sin resultados"}
            description={clients.length === 0 ? "Crea tu primer cliente o convierte un prospecto ganado desde el Pipeline." : "Ajusta el filtro o la búsqueda."}
            actions={clients.length === 0 && <Button variant="primary" onClick={() => setShowModal(true)}>+ Nuevo cliente</Button>}
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
            {filtered.map((c) => <ClientCard key={c.id} client={c} onClick={onSelectClient} />)}
          </div>
        )}
      </div>

      {showModal && (
        <NewClientModal
          workspaceId={workspaceId}
          onCreated={(c) => { onClientCreated(c); setShowModal(false); }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
