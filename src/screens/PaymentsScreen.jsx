import { useState } from "react";
import { Button } from "../components/Primitives";
import { theme } from "../app/theme";
import { useIsMobile } from "../hooks/useIsMobile";
import { updatePayment } from "../services/clients";

function fmx(n) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(n || 0);
}

function fdate(d) {
  if (!d) return "—";
  return new Date(d + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

const PAY_STATUS = [
  { id: "pagado",    label: "Pagado",    color: "#00ff88" },
  { id: "pendiente", label: "Pendiente", color: "#ffbb44" },
  { id: "vencido",   label: "Vencido",   color: "#ff4455" }
];

const PAY_TYPES = [
  { id: "unico",      label: "Único" },
  { id: "mensual",    label: "Mensual" },
  { id: "trimestral", label: "Trimestral" },
  { id: "semestral",  label: "Semestral" },
  { id: "anual",      label: "Anual" }
];

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${color}18 0%, transparent 65%)` }} />
      <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color, letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: theme.dim, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function PaymentsScreen({ payments, clients, workspaceId, onPaymentsChange }) {
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState("todos");
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = today.slice(0, 7);

  function clientName(clientId) {
    return clients.find((c) => c.id === clientId)?.name || "—";
  }

  const overdue = payments.filter((p) => p.status === "pendiente" && p.due_date < today);
  const pending = payments.filter((p) => p.status === "pendiente" && p.due_date >= today);
  const paidThisMonth = payments.filter((p) => p.status === "pagado" && (p.paid_at || "").slice(0, 7) === thisMonth);
  const mrr = payments.filter((p) => p.status !== "vencido" && p.payment_type === "mensual").reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const filtered = filter === "todos" ? payments : payments.filter((p) => p.status === filter);
  const sorted = [...filtered].sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""));

  async function markPaid(payment) {
    const updated = await updatePayment(workspaceId, { ...payment, status: "pagado", paid_at: today });
    onPaymentsChange(updated);
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ minHeight: 58, borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 12, padding: isMobile ? "12px 16px" : "0 28px", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Control de Pagos</div>
          <div style={{ fontSize: 11, color: theme.muted }}>{payments.length} registros</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 16 : 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
          <KpiCard label="MRR Recurrente" value={fmx(mrr)} sub="pagos mensuales activos" color={theme.accent} />
          <KpiCard label="Cobros del mes" value={fmx(paidThisMonth.reduce((s, p) => s + (Number(p.amount) || 0), 0))} sub={`${paidThisMonth.length} pagos recibidos`} color={theme.blue} />
          <KpiCard label="Pendientes" value={pending.length} sub={fmx(pending.reduce((s, p) => s + Number(p.amount || 0), 0))} color={theme.yellow} />
          <KpiCard label="Vencidos" value={overdue.length} sub={fmx(overdue.reduce((s, p) => s + Number(p.amount || 0), 0))} color={theme.red} />
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 8 }}>
          {[{ id: "todos", label: "Todos" }, ...PAY_STATUS].map((s) => (
            <button key={s.id} onClick={() => setFilter(s.id)} style={{
              fontSize: 11, padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontWeight: 600, border: "none",
              background: filter === s.id ? theme.accent : theme.s2,
              color: filter === s.id ? "#000" : theme.muted
            }}>{s.label}</button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 12, overflow: "hidden" }}>
          {sorted.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", fontSize: 13, color: theme.muted }}>Sin pagos{filter !== "todos" ? ` con estado "${filter}"` : ""}</div>
          ) : sorted.map((p) => {
            const isOverdue = p.status === "pendiente" && p.due_date < today;
            const st = PAY_STATUS.find((s) => s.id === p.status);
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: `1px solid ${theme.border}`, flexWrap: isMobile ? "wrap" : "nowrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {clientName(p.client_id)}
                  </div>
                  <div style={{ fontSize: 11, color: theme.muted }}>
                    {PAY_TYPES.find((t) => t.id === p.payment_type)?.label || p.payment_type}
                    {p.notes && ` · ${p.notes}`}
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: theme.text, flexShrink: 0 }}>{fmx(p.amount)}</div>
                <div style={{ fontSize: 11, color: isOverdue ? theme.red : theme.muted, flexShrink: 0, minWidth: 90, textAlign: "right" }}>
                  {isOverdue ? "⚠ " : ""}{fdate(p.due_date)}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: st?.color, background: `${st?.color}18`, padding: "3px 10px", borderRadius: 20, flexShrink: 0 }}>
                  {st?.label || p.status}
                </span>
                {p.status === "pendiente" && (
                  <Button size="sm" variant="accent" onClick={() => markPaid(p)}>✓ Cobrado</Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
