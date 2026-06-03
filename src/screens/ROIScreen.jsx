import { useState } from "react";
import { Button, Card, EmptyState } from "../components/Primitives";
import { theme } from "../app/theme";
import { formatCurrency } from "../utils/format";

const CATALOG = [
  { id: "web",       service: "Landing Page",           icon: "🌐", revenue: 3500,  clientMultiplier: 4.5, desc: "Captación activa, más leads desde búsqueda local" },
  { id: "gmb",       service: "Google My Business",      icon: "📍", revenue: 800,   clientMultiplier: 6.0, desc: "Visibilidad en Maps, reseñas y búsquedas locales" },
  { id: "ads",       service: "Meta Ads locales",        icon: "📣", revenue: 2200,  clientMultiplier: 3.5, desc: "Campañas de adquisición con segmentación local" },
  { id: "social",    service: "Contenido orgánico",      icon: "✨", revenue: 1500,  clientMultiplier: 2.8, desc: "Calendario de contenido para autoridad digital" },
  { id: "whatsapp",  service: "WhatsApp Business",       icon: "💬", revenue: 900,   clientMultiplier: 3.2, desc: "Automatización de respuestas y seguimiento" },
  { id: "ecom",      service: "Catálogo / tienda online",icon: "🛒", revenue: 1800,  clientMultiplier: 4.0, desc: "Pedidos digitales y catálogo activo" },
  { id: "seo",       service: "SEO local",               icon: "🔍", revenue: 1200,  clientMultiplier: 5.0, desc: "Posicionamiento orgánico en búsquedas locales" },
  { id: "email",     service: "Email marketing",         icon: "✉️", revenue: 1000,  clientMultiplier: 3.8, desc: "Reactivación de base y retención de clientes" }
];

function roi(rmktRevenue, clientGain) {
  if (rmktRevenue === 0) return 0;
  return Math.round(((clientGain - rmktRevenue) / rmktRevenue) * 100);
}

function payback(rmktRevenue, clientGain) {
  if (clientGain <= rmktRevenue) return "—";
  const netPerMonth = clientGain - rmktRevenue;
  const months = Math.ceil(rmktRevenue / netPerMonth);
  return `${months} mes${months !== 1 ? "es" : ""}`;
}

export function ROIScreen({ prospect, onBack }) {
  const recommended = (prospect?.analysis?.recommendedServices || []).map((s) => s.service);
  const defaultSelected = CATALOG
    .filter((item) => recommended.some((r) => r.toLowerCase().includes(item.id) || item.service.toLowerCase().includes(r.toLowerCase().split(" ")[0])))
    .map((item) => item.id);

  const [selected, setSelected] = useState(defaultSelected.length > 0 ? defaultSelected : ["web", "gmb"]);

  if (!prospect) {
    return <EmptyState title="Selecciona un prospecto" description="El estimador de ROI necesita un prospecto activo." />;
  }

  function toggle(id) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  const activeServices = CATALOG.filter((item) => selected.includes(item.id));
  const totalRmkt = activeServices.reduce((sum, s) => sum + s.revenue, 0);
  const totalClient = activeServices.reduce((sum, s) => sum + Math.round(s.revenue * s.clientMultiplier), 0);
  const roiPct = roi(totalRmkt, totalClient);
  const paybackTime = payback(totalRmkt, totalClient);
  const annualRmkt = totalRmkt * 12;
  const annualClient = totalClient * 12;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ height: 58, borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", padding: "0 28px", gap: 16, background: theme.bg, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.dim, marginBottom: 2, letterSpacing: "0.04em" }}>{prospect.name}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Estimador de ROI</div>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>← Volver</Button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "RamosMKT cobra", value: formatCurrency(totalRmkt), sub: "/mes", color: theme.accent },
            { label: "Cliente gana est.", value: formatCurrency(totalClient), sub: "/mes", color: theme.yellow },
            { label: "ROI del cliente", value: `${roiPct}%`, sub: "retorno", color: roiPct >= 200 ? theme.accent : roiPct >= 100 ? theme.yellow : theme.blue },
            { label: "Payback", value: paybackTime, sub: "para recuperar", color: theme.purple }
          ].map((m) => (
            <div key={m.label} style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{m.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: m.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{m.value}</div>
              <div style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Annual projection */}
        <div style={{ background: `linear-gradient(135deg, ${theme.s2} 0%, rgba(0,255,136,0.04) 100%)`, border: `1px solid ${theme.accentBorder}`, borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: theme.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 6 }}>Proyección anual</div>
            <div style={{ fontSize: 13, color: theme.muted }}>Con los servicios seleccionados activos 12 meses</div>
          </div>
          <div style={{ display: "flex", gap: 32, flexShrink: 0 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: theme.muted, marginBottom: 2 }}>Ingresos RamosMKT</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: theme.accent }}>{formatCurrency(annualRmkt)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: theme.muted, marginBottom: 2 }}>Valor generado al cliente</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: theme.yellow }}>{formatCurrency(annualClient)}</div>
            </div>
          </div>
        </div>

        {/* Service selector */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 14 }}>
            Servicios incluidos en la propuesta
            <span style={{ fontSize: 11, fontWeight: 400, color: theme.muted, marginLeft: 8 }}>Selecciona los que vas a ofrecer</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CATALOG.map((item) => {
              const active = selected.includes(item.id);
              const clientGain = Math.round(item.revenue * item.clientMultiplier);
              return (
                <div
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 20px",
                    background: active ? theme.s3 : theme.s2,
                    border: `1px solid ${active ? theme.accentBorder : theme.border}`,
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "all 0.12s ease"
                  }}
                >
                  {/* Toggle */}
                  <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${active ? theme.accent : theme.muted}`, background: active ? theme.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.12s ease" }}>
                    {active ? <span style={{ fontSize: 11, color: "#000", fontWeight: 900 }}>✓</span> : null}
                  </div>

                  {/* Icon + name */}
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: active ? `${theme.accent}18` : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: active ? theme.text : theme.muted }}>{item.service}</div>
                    <div style={{ fontSize: 11, color: theme.dim, marginTop: 2 }}>{item.desc}</div>
                  </div>

                  {/* Prices */}
                  <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 10, color: theme.dim, marginBottom: 2 }}>RamosMKT</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: active ? theme.accent : theme.muted }}>{formatCurrency(item.revenue)}<span style={{ fontSize: 10, fontWeight: 400 }}>/mo</span></div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 10, color: theme.dim, marginBottom: 2 }}>Cliente gana est.</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: active ? theme.yellow : theme.muted }}>{formatCurrency(clientGain)}<span style={{ fontSize: 10, fontWeight: 400 }}>/mo</span></div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 52 }}>
                      <div style={{ fontSize: 10, color: theme.dim, marginBottom: 2 }}>ROI</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: active ? theme.blue : theme.muted }}>{Math.round((clientGain / item.revenue - 1) * 100)}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ fontSize: 11, color: theme.dim, lineHeight: 1.6, padding: "12px 16px", background: theme.s2, borderRadius: 8, border: `1px solid ${theme.border}` }}>
          Los valores del cliente son estimaciones basadas en promedios de la industria (conversión, ticket promedio, retención). La ganancia real varía según el mercado local, la ejecución y el negocio del cliente. Usar como referencia para conversación comercial, no como garantía.
        </div>
      </div>
    </div>
  );
}
