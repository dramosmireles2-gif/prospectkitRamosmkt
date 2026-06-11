import { useState } from "react";
import { Button, EmptyState } from "../components/Primitives";
import { theme } from "../app/theme";
import { useIsMobile } from "../hooks/useIsMobile";
import { updateTask } from "../services/clients";

function fdate(d) {
  if (!d) return null;
  return new Date(d + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

const TASK_PRIORITY = [
  { id: "alta",  label: "Alta",  color: "#ff4455" },
  { id: "media", label: "Media", color: "#ffbb44" },
  { id: "baja",  label: "Baja",  color: "#777" }
];

const COLS = [
  { id: "pendiente",  label: "Pendiente",  color: "#ffbb44" },
  { id: "en_proceso", label: "En proceso", color: "#4a9eff" },
  { id: "terminado",  label: "Terminado",  color: "#00ff88" }
];

export function TasksScreen({ tasks, clients, workspaceId, onTasksChange }) {
  const isMobile = useIsMobile();
  const [filterClient, setFilterClient] = useState("todos");

  function clientName(id) { return clients.find((c) => c.id === id)?.name || "—"; }

  const filtered = tasks.filter((t) => filterClient === "todos" || t.client_id === filterClient);

  async function moveStatus(task, status) {
    const updated = await updateTask(workspaceId, { ...task, status });
    onTasksChange("update", updated);
  }

  const openCount = tasks.filter((t) => t.status !== "terminado").length;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ minHeight: 58, borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 12, padding: isMobile ? "12px 16px" : "0 28px", flexShrink: 0, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Tareas</div>
          <div style={{ fontSize: 11, color: theme.muted }}>{openCount} abiertas · {tasks.length} total</div>
        </div>
      </div>

      {/* Client filter */}
      {clients.length > 0 && (
        <div style={{ padding: "10px 24px", borderBottom: `1px solid ${theme.border}`, display: "flex", gap: 8, overflowX: "auto", flexShrink: 0 }}>
          <button onClick={() => setFilterClient("todos")} style={{ fontSize: 11, padding: "5px 14px", borderRadius: 20, cursor: "pointer", fontWeight: 600, border: "none", background: filterClient === "todos" ? theme.accent : theme.s2, color: filterClient === "todos" ? "#000" : theme.muted, flexShrink: 0 }}>
            Todos
          </button>
          {clients.map((c) => (
            <button key={c.id} onClick={() => setFilterClient(c.id)} style={{ fontSize: 11, padding: "5px 14px", borderRadius: 20, cursor: "pointer", fontWeight: 600, border: "none", background: filterClient === c.id ? theme.accent : theme.s2, color: filterClient === c.id ? "#000" : theme.muted, flexShrink: 0 }}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {tasks.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EmptyState title="Sin tareas" description="Las tareas se crean desde el perfil de cada cliente en la pestaña Tareas." />
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 12 : 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16, alignItems: "start" }}>
            {COLS.map((col) => {
              const colItems = filtered.filter((t) => t.status === col.id);
              return (
                <div key={col.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: col.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{col.label}</div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: col.color, borderRadius: 20, padding: "1px 7px" }}>{colItems.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 40 }}>
                    {colItems.map((t) => {
                      const prio = TASK_PRIORITY.find((p) => p.id === t.priority);
                      const today = new Date().toISOString().slice(0, 10);
                      const overdue = t.due_date && t.due_date < today && t.status !== "terminado";
                      return (
                        <div key={t.id} style={{ background: theme.s2, border: `1px solid ${overdue ? "rgba(255,68,85,0.3)" : theme.border}`, borderRadius: 12, padding: "14px 16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, flex: 1 }}>{t.title}</div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: prio?.color, background: `${prio?.color}20`, padding: "2px 8px", borderRadius: 20, flexShrink: 0 }}>
                              {prio?.label}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: theme.blue, marginBottom: t.description ? 4 : 6, fontWeight: 600 }}>
                            {clientName(t.client_id)}
                          </div>
                          {t.description && <div style={{ fontSize: 11, color: theme.muted, marginBottom: 8, lineHeight: 1.4 }}>{t.description}</div>}
                          {t.due_date && (
                            <div style={{ fontSize: 10, color: overdue ? theme.red : theme.dim, marginBottom: 8 }}>
                              {overdue ? "⚠ " : "📅 "}{fdate(t.due_date)}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {COLS.filter((c) => c.id !== col.id).map((c) => (
                              <button key={c.id} onClick={() => moveStatus(t, c.id)} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 6, border: "none", cursor: "pointer", background: theme.s3, color: theme.muted }}>
                                → {c.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {colItems.length === 0 && (
                      <div style={{ fontSize: 12, color: theme.dim, textAlign: "center", padding: "20px 0" }}>Sin tareas</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
