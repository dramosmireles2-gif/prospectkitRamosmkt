import { useState, useEffect, useCallback } from "react";
import { Button } from "../components/Primitives";
import { theme } from "../app/theme";
import { useIsMobile } from "../hooks/useIsMobile";
import {
  updateClient, deleteClient,
  listClientServices, createClientService, updateClientService, deleteClientService,
  listPayments, createPayment, updatePayment, deletePayment,
  listTasks, createTask, updateTask, deleteTask,
  listActivityLogs, createActivityLog
} from "../services/clients";

// ─── Small helpers ────────────────────────────────────────────────────────────

function fmx(n) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(n || 0);
}

function fdate(d) {
  if (!d) return "—";
  return new Date(d + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  background: "#111", border: `1px solid ${theme.border}`, borderRadius: 8,
  color: theme.text, fontSize: 13, padding: "8px 12px", outline: "none"
};

const labelSt = { fontSize: 11, color: theme.muted, display: "block", marginBottom: 4 };

function SectionHeader({ title, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.09em" }}>{title}</div>
      {action}
    </div>
  );
}

function Tag({ label, color = theme.muted }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}18`, padding: "3px 10px", borderRadius: 20 }}>
      {label}
    </span>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "servicios",    label: "Servicios" },
  { id: "pagos",        label: "Pagos" },
  { id: "tareas",       label: "Tareas" },
  { id: "seguimiento",  label: "Seguimiento" },
  { id: "docs",         label: "Recursos" },
  { id: "info",         label: "Info" }
];

// ─── Servicios tab ────────────────────────────────────────────────────────────

const SVC_STATUS = [
  { id: "activo",    label: "Activo",    color: "#00ff88" },
  { id: "pausado",   label: "Pausado",   color: "#ffbb44" },
  { id: "terminado", label: "Terminado", color: "#777" },
  { id: "cancelado", label: "Cancelado", color: "#ff4455" }
];

function ServiciosTab({ workspaceId, clientId }) {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    listClientServices(workspaceId, clientId).then(setItems);
  }, [workspaceId, clientId]);

  useEffect(() => { load(); }, [load]);

  const emptyForm = { name: "", description: "", price: "", status: "activo", contracted_at: "", delivered_at: "", responsible: "" };
  const [form, setForm] = useState(emptyForm);

  function openNew() { setForm(emptyForm); setEditing(null); setShowForm(true); }
  function openEdit(s) { setForm({ ...s, price: String(s.price || "") }); setEditing(s); setShowForm(true); }

  async function handleSave() {
    const payload = { ...form, price: Number(form.price) || 0 };
    if (editing) {
      const updated = await updateClientService(workspaceId, { ...editing, ...payload });
      setItems((prev) => prev.map((s) => s.id === updated.id ? updated : s));
    } else {
      const created = await createClientService(workspaceId, clientId, payload);
      setItems((prev) => [created, ...prev]);
    }
    setShowForm(false);
  }

  async function handleDelete(svc) {
    if (!confirm(`¿Eliminar servicio "${svc.name}"?`)) return;
    await deleteClientService(workspaceId, svc.id);
    setItems((prev) => prev.filter((s) => s.id !== svc.id));
  }

  const totalMensual = items.filter((s) => s.status === "activo").reduce((sum, s) => sum + (Number(s.price) || 0), 0);

  return (
    <div>
      <SectionHeader title="Servicios contratados" action={<Button variant="primary" size="sm" onClick={openNew}>+ Agregar</Button>} />
      {items.length > 0 && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: theme.accentBg, border: `1px solid ${theme.accentBorder}`, borderRadius: 10, fontSize: 13, color: theme.accent, fontWeight: 700 }}>
          Total activo: {fmx(totalMensual)}/mes
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((s) => (
          <div key={s.id} style={{ background: theme.s1, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{s.name}</div>
                {s.description && <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{s.description}</div>}
              </div>
              <Tag label={SVC_STATUS.find((x) => x.id === s.status)?.label || s.status} color={SVC_STATUS.find((x) => x.id === s.status)?.color} />
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: theme.muted }}>
              <span style={{ color: theme.accent, fontWeight: 700 }}>{fmx(s.price)}</span>
              {s.contracted_at && <span>Contratado: {fdate(s.contracted_at)}</span>}
              {s.delivered_at && <span>Entregado: {fdate(s.delivered_at)}</span>}
              {s.responsible && <span>👤 {s.responsible}</span>}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Button size="sm" variant="secondary" onClick={() => openEdit(s)}>Editar</Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(s)}>Eliminar</Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div style={{ fontSize: 13, color: theme.muted, textAlign: "center", padding: 32 }}>Sin servicios registrados</div>}
      </div>

      {showForm && (
        <Modal title={editing ? "Editar servicio" : "Nuevo servicio"} onClose={() => setShowForm(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Nombre del servicio *">
              <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Landing Page" autoFocus />
            </Field>
            <Field label="Descripción">
              <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Precio (MXN)">
                <input style={inputStyle} type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="0" />
              </Field>
              <Field label="Estado">
                <select style={inputStyle} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  {SVC_STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Fecha contratación">
                <input style={inputStyle} type="date" value={form.contracted_at} onChange={(e) => setForm((f) => ({ ...f, contracted_at: e.target.value }))} />
              </Field>
              <Field label="Fecha entrega">
                <input style={inputStyle} type="date" value={form.delivered_at} onChange={(e) => setForm((f) => ({ ...f, delivered_at: e.target.value }))} />
              </Field>
            </div>
            <Field label="Responsable">
              <input style={inputStyle} value={form.responsible} onChange={(e) => setForm((f) => ({ ...f, responsible: e.target.value }))} placeholder="Carlos Ramos" />
            </Field>
            <ModalActions onClose={() => setShowForm(false)} onSave={handleSave} disabled={!form.name.trim()} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Pagos tab ────────────────────────────────────────────────────────────────

const PAY_STATUS = [
  { id: "pagado",    label: "Pagado",    color: "#00ff88" },
  { id: "pendiente", label: "Pendiente", color: "#ffbb44" },
  { id: "vencido",   label: "Vencido",   color: "#ff4455" }
];

const PAY_TYPES = [
  { id: "unico",       label: "Único" },
  { id: "mensual",     label: "Mensual" },
  { id: "trimestral",  label: "Trimestral" },
  { id: "semestral",   label: "Semestral" },
  { id: "anual",       label: "Anual" }
];

function PagosTab({ workspaceId, clientId }) {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(() => {
    listPayments(workspaceId, clientId).then(setItems);
  }, [workspaceId, clientId]);

  useEffect(() => { load(); }, [load]);

  const emptyForm = { amount: "", payment_type: "mensual", due_date: "", status: "pendiente", notes: "", paid_at: "" };
  const [form, setForm] = useState(emptyForm);

  function openNew() { setForm(emptyForm); setEditing(null); setShowForm(true); }
  function openEdit(p) { setForm({ ...p, amount: String(p.amount || "") }); setEditing(p); setShowForm(true); }

  async function handleSave() {
    const payload = { ...form, amount: Number(form.amount) || 0 };
    if (editing) {
      const updated = await updatePayment(workspaceId, { ...editing, ...payload });
      setItems((prev) => prev.map((p) => p.id === updated.id ? updated : p));
    } else {
      const created = await createPayment(workspaceId, clientId, payload);
      setItems((prev) => [...prev, created].sort((a, b) => (a.due_date || "").localeCompare(b.due_date || "")));
    }
    setShowForm(false);
  }

  async function markPaid(payment) {
    const updated = await updatePayment(workspaceId, { ...payment, status: "pagado", paid_at: today });
    setItems((prev) => prev.map((p) => p.id === updated.id ? updated : p));
  }

  async function handleDelete(payment) {
    if (!confirm("¿Eliminar este pago?")) return;
    await deletePayment(workspaceId, payment.id);
    setItems((prev) => prev.filter((p) => p.id !== payment.id));
  }

  const overdueCount = items.filter((p) => p.status === "pendiente" && p.due_date < today).length;

  return (
    <div>
      <SectionHeader title="Historial de pagos" action={<Button variant="primary" size="sm" onClick={openNew}>+ Registrar pago</Button>} />
      {overdueCount > 0 && (
        <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(255,68,85,0.08)", border: "1px solid rgba(255,68,85,0.2)", borderRadius: 10, fontSize: 13, color: theme.red, fontWeight: 700 }}>
          ⚠ {overdueCount} pago{overdueCount > 1 ? "s" : ""} vencido{overdueCount > 1 ? "s" : ""}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((p) => {
          const overdue = p.status === "pendiente" && p.due_date < today;
          return (
            <div key={p.id} style={{ background: theme.s1, border: `1px solid ${overdue ? "rgba(255,68,85,0.3)" : theme.border}`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{fmx(p.amount)}</span>
                  <Tag label={PAY_TYPES.find((t) => t.id === p.payment_type)?.label || p.payment_type} color={theme.blue} />
                  <Tag label={PAY_STATUS.find((s) => s.id === p.status)?.label || p.status} color={PAY_STATUS.find((s) => s.id === p.status)?.color} />
                </div>
                <div style={{ fontSize: 11, color: theme.muted }}>
                  Vence: {fdate(p.due_date)}
                  {p.paid_at && ` · Pagado: ${fdate(p.paid_at)}`}
                  {p.notes && ` · ${p.notes}`}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {p.status === "pendiente" && <Button size="sm" variant="accent" onClick={() => markPaid(p)}>✓ Pagado</Button>}
                <Button size="sm" variant="secondary" onClick={() => openEdit(p)}>Editar</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(p)}>✕</Button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <div style={{ fontSize: 13, color: theme.muted, textAlign: "center", padding: 32 }}>Sin pagos registrados</div>}
      </div>

      {showForm && (
        <Modal title={editing ? "Editar pago" : "Registrar pago"} onClose={() => setShowForm(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Monto (MXN)">
                <input style={inputStyle} type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0" autoFocus />
              </Field>
              <Field label="Tipo">
                <select style={inputStyle} value={form.payment_type} onChange={(e) => setForm((f) => ({ ...f, payment_type: e.target.value }))}>
                  {PAY_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Fecha vencimiento">
                <input style={inputStyle} type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} />
              </Field>
              <Field label="Estado">
                <select style={inputStyle} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  {PAY_STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </Field>
            </div>
            {form.status === "pagado" && (
              <Field label="Fecha de pago">
                <input style={inputStyle} type="date" value={form.paid_at} onChange={(e) => setForm((f) => ({ ...f, paid_at: e.target.value }))} />
              </Field>
            )}
            <Field label="Notas">
              <input style={inputStyle} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Referencia, concepto..." />
            </Field>
            <ModalActions onClose={() => setShowForm(false)} onSave={handleSave} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Tareas tab ───────────────────────────────────────────────────────────────

const TASK_PRIORITY = [
  { id: "alta",  label: "Alta",  color: "#ff4455" },
  { id: "media", label: "Media", color: "#ffbb44" },
  { id: "baja",  label: "Baja",  color: "#777" }
];

const TASK_STATUS_COLS = [
  { id: "pendiente",   label: "Pendiente",   color: "#ffbb44" },
  { id: "en_proceso",  label: "En proceso",  color: "#4a9eff" },
  { id: "terminado",   label: "Terminado",   color: "#00ff88" }
];

function TareasTab({ workspaceId, clientId }) {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    listTasks(workspaceId, clientId).then(setItems);
  }, [workspaceId, clientId]);

  useEffect(() => { load(); }, [load]);

  const emptyForm = { title: "", description: "", priority: "media", due_date: "", status: "pendiente", comments: "" };
  const [form, setForm] = useState(emptyForm);

  function openNew() { setForm(emptyForm); setEditing(null); setShowForm(true); }
  function openEdit(t) { setForm({ ...t }); setEditing(t); setShowForm(true); }

  async function handleSave() {
    if (editing) {
      const updated = await updateTask(workspaceId, { ...editing, ...form });
      setItems((prev) => prev.map((t) => t.id === updated.id ? updated : t));
    } else {
      const created = await createTask(workspaceId, clientId, form);
      setItems((prev) => [created, ...prev]);
    }
    setShowForm(false);
  }

  async function moveStatus(task, status) {
    const updated = await updateTask(workspaceId, { ...task, status });
    setItems((prev) => prev.map((t) => t.id === updated.id ? updated : t));
  }

  async function handleDelete(task) {
    if (!confirm(`¿Eliminar tarea "${task.title}"?`)) return;
    await deleteTask(workspaceId, task.id);
    setItems((prev) => prev.filter((t) => t.id !== task.id));
  }

  return (
    <div>
      <SectionHeader title="Tareas y cambios" action={<Button variant="primary" size="sm" onClick={openNew}>+ Nueva tarea</Button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {TASK_STATUS_COLS.map((col) => {
          const colItems = items.filter((t) => t.status === col.id);
          return (
            <div key={col.id}>
              <div style={{ fontSize: 11, fontWeight: 700, color: col.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                {col.label}
                <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: col.color, borderRadius: 20, padding: "1px 7px" }}>{colItems.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 60 }}>
                {colItems.map((t) => {
                  const prio = TASK_PRIORITY.find((p) => p.id === t.priority);
                  return (
                    <div key={t.id} style={{ background: theme.s1, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, flex: 1 }}>{t.title}</div>
                        <Tag label={prio?.label || t.priority} color={prio?.color} />
                      </div>
                      {t.description && <div style={{ fontSize: 11, color: theme.muted, marginBottom: 8 }}>{t.description}</div>}
                      {t.due_date && <div style={{ fontSize: 10, color: theme.dim, marginBottom: 8 }}>📅 {fdate(t.due_date)}</div>}
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {TASK_STATUS_COLS.filter((c) => c.id !== col.id).map((c) => (
                          <button key={c.id} onClick={() => moveStatus(t, c.id)} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, border: "none", cursor: "pointer", background: theme.s3, color: theme.muted }}>
                            → {c.label}
                          </button>
                        ))}
                        <button onClick={() => openEdit(t)} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, border: "none", cursor: "pointer", background: theme.s3, color: theme.muted }}>Editar</button>
                        <button onClick={() => handleDelete(t)} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, border: "none", cursor: "pointer", background: "rgba(255,68,85,0.1)", color: theme.red }}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <Modal title={editing ? "Editar tarea" : "Nueva tarea"} onClose={() => setShowForm(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Título *">
              <input style={inputStyle} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ej: Actualizar catálogo de productos" autoFocus />
            </Field>
            <Field label="Descripción">
              <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Field label="Prioridad">
                <select style={inputStyle} value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                  {TASK_PRIORITY.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </Field>
              <Field label="Estado">
                <select style={inputStyle} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  {TASK_STATUS_COLS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="Fecha límite">
                <input style={inputStyle} type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} />
              </Field>
            </div>
            <Field label="Comentarios">
              <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} value={form.comments} onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))} />
            </Field>
            <ModalActions onClose={() => setShowForm(false)} onSave={handleSave} disabled={!form.title.trim()} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Seguimiento tab ──────────────────────────────────────────────────────────

const LOG_TYPES = [
  { id: "llamada",   label: "Llamada",   icon: "📞" },
  { id: "whatsapp",  label: "WhatsApp",  icon: "💬" },
  { id: "reunion",   label: "Reunión",   icon: "📅" },
  { id: "solicitud", label: "Solicitud", icon: "📋" },
  { id: "pago",      label: "Pago",      icon: "💰" },
  { id: "cambio",    label: "Cambio",    icon: "🔧" },
  { id: "nota",      label: "Nota",      icon: "📝" }
];

function SeguimientoTab({ workspaceId, clientId }) {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "nota", description: "", responsible: "" });

  const load = useCallback(() => {
    listActivityLogs(workspaceId, clientId).then(setLogs);
  }, [workspaceId, clientId]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!form.description.trim()) return;
    const created = await createActivityLog(workspaceId, clientId, form);
    setLogs((prev) => [created, ...prev]);
    setForm({ type: "nota", description: "", responsible: "" });
    setShowForm(false);
  }

  return (
    <div>
      <SectionHeader title="Bitácora de actividad" action={<Button variant="primary" size="sm" onClick={() => setShowForm((v) => !v)}>+ Registrar</Button>} />

      {showForm && (
        <div style={{ background: theme.s1, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Tipo">
              <select style={inputStyle} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {LOG_TYPES.map((t) => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
              </select>
            </Field>
            <Field label="Responsable">
              <input style={inputStyle} value={form.responsible} onChange={(e) => setForm((f) => ({ ...f, responsible: e.target.value }))} placeholder="Carlos Ramos" />
            </Field>
          </div>
          <Field label="Descripción *">
            <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 72 }} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="¿Qué pasó?" autoFocus />
          </Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button size="sm" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button size="sm" variant="primary" onClick={handleAdd} disabled={!form.description.trim()}>Guardar</Button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {logs.map((log, i) => {
          const lt = LOG_TYPES.find((t) => t.id === log.type);
          return (
            <div key={log.id} style={{ display: "flex", gap: 14, paddingBottom: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: theme.s3, border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                  {lt?.icon || "📝"}
                </div>
                {i < logs.length - 1 && <div style={{ flex: 1, width: 1, background: theme.border, marginTop: 4 }} />}
              </div>
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>{lt?.label || log.type}</span>
                  {log.responsible && <span style={{ fontSize: 11, color: theme.muted }}>· {log.responsible}</span>}
                  <span style={{ fontSize: 10, color: theme.dim, marginLeft: "auto" }}>
                    {new Date(log.happened_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: theme.muted, lineHeight: 1.5 }}>{log.description}</div>
              </div>
            </div>
          );
        })}
        {logs.length === 0 && <div style={{ fontSize: 13, color: theme.muted, textAlign: "center", padding: 32 }}>Sin actividad registrada</div>}
      </div>
    </div>
  );
}

// ─── Docs tab ─────────────────────────────────────────────────────────────────

const DOC_FIELDS = [
  { key: "website_url",        label: "Sitio web",         icon: "🌐", placeholder: "https://negocio.com" },
  { key: "github_url",         label: "GitHub",            icon: "🐙", placeholder: "https://github.com/..." },
  { key: "supabase_url",       label: "Supabase",          icon: "⚡", placeholder: "https://app.supabase.com/..." },
  { key: "vercel_url",         label: "Vercel",            icon: "▲",  placeholder: "https://vercel.com/..." },
  { key: "domain",             label: "Dominio",           icon: "🔗", placeholder: "negocio.com" },
  { key: "hosting",            label: "Hosting",           icon: "🖥",  placeholder: "Proveedor / panel" },
  { key: "meta_business_url",  label: "Meta Business",     icon: "📘", placeholder: "https://business.facebook.com/..." },
  { key: "google_workspace",   label: "Google Workspace",  icon: "📧", placeholder: "admin@negocio.com" },
  { key: "analytics_url",      label: "Analytics",         icon: "📊", placeholder: "https://analytics.google.com/..." },
  { key: "search_console_url", label: "Search Console",    icon: "🔍", placeholder: "https://search.google.com/..." }
];

function DocsTab({ client, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  function startEdit() {
    setForm(Object.fromEntries(DOC_FIELDS.map((f) => [f.key, client[f.key] || ""])));
    setEditing(true);
  }

  async function handleSave() {
    setBusy(true);
    try {
      const updated = await updateClient({ ...client, ...form });
      onUpdate(updated);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <div>
        <SectionHeader title="Recursos digitales" action={
          <div style={{ display: "flex", gap: 8 }}>
            <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button>
            <Button size="sm" variant="primary" onClick={handleSave} disabled={busy}>{busy ? "Guardando..." : "Guardar"}</Button>
          </div>
        } />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DOC_FIELDS.map((f) => (
            <Field key={f.key} label={`${f.icon} ${f.label}`}>
              <input style={inputStyle} value={form[f.key] || ""} onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} />
            </Field>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Recursos digitales" action={<Button size="sm" variant="secondary" onClick={startEdit}>Editar</Button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
        {DOC_FIELDS.map((f) => {
          const val = client[f.key];
          return (
            <div key={f.key} style={{ background: theme.s1, border: `1px solid ${val ? theme.borderStrong : theme.border}`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: theme.muted, marginBottom: 4 }}>{f.icon} {f.label}</div>
              {val ? (
                val.startsWith("http") ? (
                  <a href={val} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: theme.blue, wordBreak: "break-all", display: "block" }}>{val}</a>
                ) : (
                  <div style={{ fontSize: 12, color: theme.text, wordBreak: "break-all" }}>{val}</div>
                )
              ) : (
                <div style={{ fontSize: 12, color: theme.dim }}>Sin configurar</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Info tab ─────────────────────────────────────────────────────────────────

const CLIENT_STATUS_LIST = [
  { id: "activo",  label: "Activo",  color: "#00ff88" },
  { id: "pausado", label: "Pausado", color: "#ffbb44" },
  { id: "perdido", label: "Perdido", color: "#ff4455" }
];

function InfoTab({ client, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  function startEdit() {
    setForm({
      name: client.name || "",
      contact_name: client.contact_name || "",
      whatsapp: client.whatsapp || "",
      email: client.email || "",
      city: client.city || "",
      status: client.status || "activo",
      started_at: client.started_at || "",
      notes: client.notes || ""
    });
    setEditing(true);
  }

  async function handleSave() {
    setBusy(true);
    try {
      const updated = await updateClient({ ...client, ...form });
      onUpdate(updated);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <div>
        <SectionHeader title="Información del cliente" action={
          <div style={{ display: "flex", gap: 8 }}>
            <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button>
            <Button size="sm" variant="primary" onClick={handleSave} disabled={busy}>{busy ? "Guardando..." : "Guardar"}</Button>
          </div>
        } />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Nombre del negocio">
            <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Contacto">
              <input style={inputStyle} value={form.contact_name} onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))} />
            </Field>
            <Field label="Ciudad">
              <input style={inputStyle} value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </Field>
            <Field label="WhatsApp">
              <input style={inputStyle} value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} />
            </Field>
            <Field label="Correo">
              <input style={inputStyle} type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Estado">
              <select style={inputStyle} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                {CLIENT_STATUS_LIST.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Fecha de alta">
              <input style={inputStyle} type="date" value={form.started_at} onChange={(e) => setForm((f) => ({ ...f, started_at: e.target.value }))} />
            </Field>
          </div>
          <Field label="Notas generales">
            <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </Field>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Información del cliente" action={<Button size="sm" variant="secondary" onClick={startEdit}>Editar</Button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Contacto", value: client.contact_name },
          { label: "Ciudad", value: client.city },
          { label: "WhatsApp", value: client.whatsapp },
          { label: "Correo", value: client.email },
          { label: "Fecha de alta", value: fdate(client.started_at) },
          { label: "Estado", value: CLIENT_STATUS_LIST.find((s) => s.id === client.status)?.label }
        ].map((item) => item.value ? (
          <div key={item.label} style={{ background: theme.s1, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: theme.muted, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 13, color: theme.text, fontWeight: 500 }}>{item.value}</div>
          </div>
        ) : null)}
      </div>
      {client.notes && (
        <div style={{ background: theme.s1, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: theme.muted, marginBottom: 6 }}>NOTAS</div>
          <div style={{ fontSize: 13, color: theme.muted, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{client.notes}</div>
        </div>
      )}
      <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${theme.border}` }}>
        <Button variant="danger" size="sm" onClick={() => { if (confirm(`¿Eliminar cliente "${client.name}"? Esta acción no se puede deshacer.`)) onDelete(); }}>
          Eliminar cliente
        </Button>
      </div>
    </div>
  );
}

// ─── Shared UI atoms ─────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div>
      <label style={labelSt}>{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24, width: "min(500px, 100%)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 18 }}>{title}</div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onClose, onSave, disabled }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
      <Button size="sm" variant="secondary" onClick={onClose} type="button">Cancelar</Button>
      <Button size="sm" variant="primary" onClick={onSave} disabled={disabled} type="button">Guardar</Button>
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function ClientDetailScreen({ client, workspaceId, onBack, onUpdate, onDelete }) {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState("servicios");

  if (!client) return null;

  const stColor = CLIENT_STATUS_LIST.find((s) => s.id === client.status)?.color || "#777";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ minHeight: 58, borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 12, padding: isMobile ? "12px 16px" : "0 28px", flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: theme.muted, cursor: "pointer", fontSize: 18, padding: "0 4px" }}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.name}</div>
          <div style={{ fontSize: 11, color: theme.muted }}>
            {client.city && `${client.city} · `}
            <span style={{ color: stColor, fontWeight: 700 }}>
              {CLIENT_STATUS_LIST.find((s) => s.id === client.status)?.label}
            </span>
          </div>
        </div>
        {client.whatsapp && (
          <a href={`https://wa.me/${client.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
            <Button size="sm" variant="secondary">💬 WhatsApp</Button>
          </a>
        )}
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${theme.border}`, padding: "0 20px", display: "flex", gap: 2, overflowX: "auto", flexShrink: 0 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "11px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: "none", border: "none", borderBottom: tab === t.id ? `2px solid ${theme.accent}` : "2px solid transparent",
              color: tab === t.id ? theme.accent : theme.muted, whiteSpace: "nowrap", transition: "all 0.12s"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 16 : 24 }}>
        {tab === "servicios"   && <ServiciosTab    workspaceId={workspaceId} clientId={client.id} />}
        {tab === "pagos"       && <PagosTab        workspaceId={workspaceId} clientId={client.id} />}
        {tab === "tareas"      && <TareasTab       workspaceId={workspaceId} clientId={client.id} />}
        {tab === "seguimiento" && <SeguimientoTab  workspaceId={workspaceId} clientId={client.id} />}
        {tab === "docs"        && <DocsTab         client={client} onUpdate={onUpdate} />}
        {tab === "info"        && <InfoTab         client={client} onUpdate={onUpdate} onDelete={onDelete} />}
      </div>
    </div>
  );
}
