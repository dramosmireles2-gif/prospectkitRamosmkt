import { useState } from "react";
import { Button, EmptyState } from "../components/Primitives";
import { theme } from "../app/theme";
import { formatCurrency } from "../utils/format";
import { useIsMobile } from "../hooks/useIsMobile";
import {
  SERVICE_CATALOG,
  formatServicePricing,
  getClientMonthlyGain,
  getOneTimePrice,
  getRecurringPrice,
  getServiceBillingType,
  getSetupPrice
} from "../services/serviceCatalog";

function roi(cost, value) {
  if (cost <= 0) return 0;
  return Math.round(((value - cost) / cost) * 100);
}

function paybackMonths(initialCost, monthlyMargin) {
  if (initialCost <= 0) return "Sin anticipo";
  if (monthlyMargin <= 0) return "No recupera";
  const months = Math.ceil(initialCost / monthlyMargin);
  return `${months} mes${months !== 1 ? "es" : ""}`;
}

function getActiveProposal(proposals) {
  if (!proposals?.length) return null;
  const priority = ["aceptada", "negociacion", "enviada", "borrador"];
  for (const status of priority) {
    const found = proposals.find((proposal) => proposal.status === status);
    if (found) return found;
  }
  return proposals[0];
}

function buildServiceFromCatalog(item, proposalService) {
  const isAnual = item.type === "anual";
  return {
    ...item,
    billingType: item.type,
    oneTimePrice: item.type === "unico" ? (proposalService?.negotiatedPrice ?? item.price) : 0,
    anualPrice: isAnual ? (proposalService?.negotiatedPrice ?? item.price) : 0,
    setupPrice: item.type === "setup+mensual" ? (proposalService?.negotiatedSetupPrice ?? item.setupPrice) : 0,
    monthlyPrice:
      item.type === "mensual" || item.type === "setup+mensual"
        ? (proposalService?.negotiatedPrice ?? item.price)
        : 0,
    clientMonthlyGain: proposalService?.clientMonthlyGain ?? item.clientMonthlyGain
  };
}

export function ROIScreen({ prospect, proposals, onBack }) {
  const isMobile = useIsMobile();
  const activeProposal = getActiveProposal(proposals);

  if (!prospect) {
    return <EmptyState title="Selecciona un prospecto" description="El estimador de ROI necesita un prospecto activo." />;
  }

  const proposalServiceMap = Object.fromEntries((activeProposal?.services || []).map((service) => [service.id, service]));
  const recommendedIds = (prospect.analysis?.recommendedServices || []).map((service) => service.catalogId || service.id);
  const defaultSelected = activeProposal?.services?.length
    ? activeProposal.services.map((service) => service.id)
    : SERVICE_CATALOG.filter((item) => recommendedIds.includes(item.id)).map((item) => item.id);

  const [selected, setSelected] = useState(defaultSelected.length > 0 ? defaultSelected : ["web", "gmb"]);

  function toggle(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]));
  }

  const activeServices = SERVICE_CATALOG.filter((item) => selected.includes(item.id)).map((item) =>
    buildServiceFromCatalog(item, proposalServiceMap[item.id])
  );

  const totalInitial = activeServices.reduce((sum, service) => sum + getOneTimePrice(service) + getSetupPrice(service), 0);
  const totalAnual = activeServices.reduce((sum, service) => sum + (service.anualPrice || 0), 0);
  const totalMonthly = activeServices.reduce((sum, service) => sum + getRecurringPrice(service), 0);
  const totalClientMonthly = activeServices.reduce((sum, service) => sum + getClientMonthlyGain(service), 0);
  const firstYearRmkt = totalInitial + totalAnual + totalMonthly * 12;
  const firstYearClient = totalClientMonthly * 12;
  const roiPct = roi(firstYearRmkt, firstYearClient);
  const monthlyMargin = totalClientMonthly - totalMonthly;
  const paybackTime = paybackMonths(totalInitial, monthlyMargin);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ minHeight: isMobile ? 72 : 58, borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: isMobile ? "flex-start" : "center", flexWrap: isMobile ? "wrap" : "nowrap", padding: isMobile ? "12px 16px" : "0 28px", gap: 16, background: theme.bg, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.dim, marginBottom: 2, letterSpacing: "0.04em" }}>{prospect.name}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Estimador de ROI</div>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>Volver</Button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 16 : 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {activeProposal && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "rgba(0,255,136,0.06)", border: `1px solid ${theme.accentBorder}`, borderRadius: 10, fontSize: 12, color: theme.muted }}>
            <span style={{ fontSize: 16 }}>P</span>
            <span>Usando precios de <strong style={{ color: theme.accent }}>Propuesta v{activeProposal.version}</strong>. El calculo ya separa pago inicial y mensualidad.</span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)", gap: 12 }}>
          {[
            { label: "Pago inicial", value: formatCurrency(totalInitial), sub: "sitio, setup o proyecto", color: theme.blue },
            { label: "Anual (infra)", value: formatCurrency(totalAnual), sub: "dominio + hosting + mtt", color: "#9966ff" },
            { label: "Mensual RamosGrowth", value: formatCurrency(totalMonthly), sub: "recurrente", color: theme.accent },
            { label: "Cliente gana est.", value: formatCurrency(totalClientMonthly), sub: "por mes", color: theme.yellow },
            { label: "ROI 12 meses", value: `${roiPct}%`, sub: "incluye inicial + anual", color: roiPct >= 200 ? theme.accent : roiPct >= 100 ? theme.yellow : theme.blue }
          ].map((metric) => (
            <div key={metric.label} style={{ background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{metric.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: metric.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{metric.value}</div>
              <div style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>{metric.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ background: `linear-gradient(135deg, ${theme.s2} 0%, rgba(0,255,136,0.04) 100%)`, border: `1px solid ${theme.accentBorder}`, borderRadius: 12, padding: "20px 24px", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: theme.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 6 }}>Lectura de 12 meses</div>
            <div style={{ fontSize: 13, color: theme.muted }}>Suma el pago inicial y 12 meses de servicios recurrentes para que el sitio no parezca mensual cuando no lo es.</div>
          </div>
          <div style={{ display: "flex", gap: isMobile ? 18 : 32, flexShrink: 0, width: isMobile ? "100%" : "auto", flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: theme.muted, marginBottom: 2 }}>RamosGrowth 12 meses</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: theme.accent }}>{formatCurrency(firstYearRmkt)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: theme.muted, marginBottom: 2 }}>Valor al cliente 12 meses</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: theme.yellow }}>{formatCurrency(firstYearClient)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: theme.muted, marginBottom: 2 }}>Recuperacion del inicial</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: theme.blue }}>{paybackTime}</div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 14 }}>
            Servicios incluidos en la propuesta
            <span style={{ fontSize: 11, fontWeight: 400, color: theme.muted, marginLeft: 8 }}>Selecciona los que vas a ofrecer</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SERVICE_CATALOG.map((item) => {
              const active = selected.includes(item.id);
              const service = buildServiceFromCatalog(item, proposalServiceMap[item.id]);
              const billingType = getServiceBillingType(service);
              const clientGain = getClientMonthlyGain(service);
              const serviceRoi = roi(getOneTimePrice(service) + getRecurringPrice(service) * 12, clientGain * 12);
              return (
                <div
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  style={{
                    display: "flex",
                    alignItems: isMobile ? "flex-start" : "center",
                    flexDirection: isMobile ? "column" : "row",
                    gap: 16,
                    padding: "16px 20px",
                    background: active ? theme.s3 : theme.s2,
                    border: `1px solid ${active ? theme.accentBorder : theme.border}`,
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "all 0.12s ease"
                  }}
                >
                  <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${active ? theme.accent : theme.muted}`, background: active ? theme.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.12s ease" }}>
                    {active ? <span style={{ fontSize: 11, color: "#000", fontWeight: 900 }}>+</span> : null}
                  </div>

                  <div style={{ width: 36, height: 36, borderRadius: 9, background: active ? `${theme.accent}18` : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: active ? theme.text : theme.muted }}>{item.service}</div>
                    <div style={{ fontSize: 11, color: theme.dim, marginTop: 2 }}>{item.desc}</div>
                    <div style={{ fontSize: 11, color: theme.accent, marginTop: 6 }}>{formatServicePricing(service)}</div>
                    <div style={{ fontSize: 10, color: theme.muted, marginTop: 4 }}>{item.billingNote}</div>
                  </div>

                  <div style={{ display: "flex", gap: 24, flexShrink: 0, flexWrap: isMobile ? "wrap" : "nowrap" }}>
                    {getOneTimePrice(service) + getSetupPrice(service) > 0 && (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 10, color: theme.dim, marginBottom: 2 }}>Cobro inicial</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: active ? theme.blue : theme.muted }}>{formatCurrency(getOneTimePrice(service) + getSetupPrice(service))}</div>
                      </div>
                    )}
                    {service.anualPrice > 0 && (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 10, color: theme.dim, marginBottom: 2 }}>Anual</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: active ? "#9966ff" : theme.muted }}>{formatCurrency(service.anualPrice)}</div>
                      </div>
                    )}
                    {getRecurringPrice(service) > 0 && (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 10, color: theme.dim, marginBottom: 2 }}>Mensual</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: active ? theme.accent : theme.muted }}>{formatCurrency(getRecurringPrice(service))}</div>
                      </div>
                    )}
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 10, color: theme.dim, marginBottom: 2 }}>Cliente gana est.</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: active ? theme.yellow : theme.muted }}>{formatCurrency(clientGain)}<span style={{ fontSize: 10, fontWeight: 400 }}> /mes</span></div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 56 }}>
                      <div style={{ fontSize: 10, color: theme.dim, marginBottom: 2 }}>ROI 12m</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: active ? theme.blue : theme.muted }}>{serviceRoi}%</div>
                    </div>
                  </div>

                  <div style={{ padding: "3px 10px", borderRadius: 999, border: `1px solid ${theme.border}`, background: theme.s1, fontSize: 10, color: theme.muted, flexShrink: 0 }}>
                    {billingType === "unico" ? "Pago unico" : billingType === "setup+mensual" ? "Setup + mensual" : "Mensual"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ fontSize: 11, color: theme.dim, lineHeight: 1.6, padding: "12px 16px", background: theme.s2, borderRadius: 8, border: `1px solid ${theme.border}` }}>
          Los valores del cliente son estimaciones comerciales. En servicios de pago unico, el ROI se proyecta a 12 meses para que quede claro que el sitio se cobra una vez y despues solo aplican los cargos recurrentes que realmente selecciones.
        </div>
      </div>
    </div>
  );
}
