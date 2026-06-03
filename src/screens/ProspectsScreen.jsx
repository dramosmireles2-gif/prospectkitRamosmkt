import { useState } from "react";
import { Badge, Button, Card, Field, LikelihoodBar, ModalFrame, TemperatureBadge } from "../components/Primitives";
import { theme } from "../app/theme";
import { INDUSTRIES } from "../app/constants";
import { validateProspectForm } from "../utils/validation";
import { exportProspectsCsv } from "../utils/exportCsv";

function scoreColor(score) {
  if (score >= 85) return theme.accent;
  if (score >= 70) return theme.yellow;
  if (score >= 55) return theme.blue;
  return theme.muted;
}

function IndustrySelect({ value, onChange, error }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 11, color: error ? theme.red : theme.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>
        Industria *
      </span>
      <input
        list="industry-options"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Selecciona o escribe..."
        style={{
          background: theme.s3,
          border: `1px solid ${error ? "rgba(255,68,85,0.4)" : theme.border}`,
          borderRadius: 8,
          padding: "10px 12px",
          color: theme.text,
          fontSize: 13,
          outline: "none",
          width: "100%"
        }}
      />
      <datalist id="industry-options">
        {INDUSTRIES.map((ind) => (
          <option key={ind} value={ind} />
        ))}
      </datalist>
      {error ? <span style={{ fontSize: 11, color: theme.red, marginTop: -2 }}>{error}</span> : null}
    </label>
  );
}

function NewProspectModal({ onClose, onAdd, busy }) {
  const [form, setForm] = useState({
    name: "",
    industry: "",
    city: "",
    website: "",
    instagram: "",
    facebook: "",
    whatsapp: "",
    notes: ""
  });
  const [fieldErrors, setFieldErrors] = useState({});

  function handleSubmit() {
    const { valid, errors } = validateProspectForm(form);
    setFieldErrors(errors);
    if (valid) onAdd(form);
  }

  return (
    <ModalFrame title="Nuevo prospecto" description="Agrega un negocio al workspace y calcula su oportunidad con heurística." onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Nombre *" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} placeholder="Bella Cocina" error={fieldErrors.name} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <IndustrySelect value={form.industry} onChange={(value) => setForm((current) => ({ ...current, industry: value }))} error={fieldErrors.industry} />
          <Field label="Ciudad *" value={form.city} onChange={(value) => setForm((current) => ({ ...current, city: value }))} placeholder="Monterrey, NL" error={fieldErrors.city} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Website" value={form.website} onChange={(value) => setForm((current) => ({ ...current, website: value }))} placeholder="ejemplo.com" type="url" error={fieldErrors.website} />
          <Field label="Instagram" value={form.instagram} onChange={(value) => setForm((current) => ({ ...current, instagram: value }))} placeholder="@usuario" error={fieldErrors.instagram} />
          <Field label="Facebook" value={form.facebook} onChange={(value) => setForm((current) => ({ ...current, facebook: value }))} placeholder="NombrePagina" />
          <Field label="WhatsApp" value={form.whatsapp} onChange={(value) => setForm((current) => ({ ...current, whatsapp: value }))} placeholder="+52 81 0000 0000" type="tel" error={fieldErrors.whatsapp} />
        </div>
        <Field label="Notas" value={form.notes} onChange={(value) => setForm((current) => ({ ...current, notes: value }))} placeholder="Contexto del negocio, observaciones y oportunidades." textarea />
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={busy} style={{ flex: 2 }}>
            {busy ? "Guardando..." : "Crear prospecto"}
          </Button>
        </div>
      </div>
    </ModalFrame>
  );
}

function ProspectCard({ prospect, onOpen }) {
  const color = scoreColor(prospect.opportunityScore);
  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 14 }} onClick={() => onOpen(prospect)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: theme.accentBg,
              border: `1px solid ${theme.accentBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              fontWeight: 800,
              color: theme.accent,
              flexShrink: 0
            }}
          >
            {prospect.name[0]}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{prospect.name}</div>
            <div style={{ fontSize: 11, color: theme.muted }}>
              {prospect.industry} · {prospect.city}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Badge status={prospect.status} />
          <TemperatureBadge temperature={prospect.leadTemperature} size="sm" />
        </div>
      </div>

      <div style={{ padding: "12px 0", borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Score de oportunidad
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 34, fontWeight: 900, color, letterSpacing: "-0.03em", lineHeight: 1 }}>{prospect.opportunityScore}</div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 5, background: theme.border, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${prospect.opportunityScore}%`, background: color, borderRadius: 3 }} />
            </div>
            {prospect.analysis ? <div style={{ fontSize: 10, color: theme.muted, marginTop: 4 }}>{prospect.analysis.scoreLabel}</div> : null}
            <div style={{ marginTop: 8 }}><LikelihoodBar score={prospect.salesLikelihoodScore} /></div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Button variant="secondary" size="sm" style={{ flex: 1 }} onClick={() => onOpen(prospect)}>
          {prospect.analysis ? "Ver análisis" : "Ver ficha"}
        </Button>
        {prospect.analysis ? <Button variant="ghost" size="sm">✦</Button> : null}
        {prospect.analysis ? <Button variant="ghost" size="sm">▣</Button> : null}
      </div>
    </Card>
  );
}

export function ProspectsScreen({ prospects, onCreate, onOpenProspect, onDeleteProspect, busy }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const filtered = prospects.filter((prospect) => {
    const query = search.toLowerCase();
    return (
      (!query ||
        prospect.name.toLowerCase().includes(query) ||
        prospect.industry.toLowerCase().includes(query) ||
        prospect.city.toLowerCase().includes(query)) &&
      (filter === "all" || prospect.status === filter)
    );
  });

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
          <div style={{ fontSize: 11, color: theme.dim, marginBottom: 2, letterSpacing: "0.04em" }}>{prospects.length} prospectos · ordenados por score</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Prospectos</div>
        </div>
        {prospects.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={() => exportProspectsCsv(filtered)}>
            Exportar CSV
          </Button>
        ) : null}
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          + Nuevo prospecto
        </Button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 260, maxWidth: 340 }}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar negocio..."
              style={{
                width: "100%",
                background: theme.s2,
                border: `1px solid ${theme.border}`,
                borderRadius: 8,
                padding: "9px 12px 9px 34px",
                color: theme.text,
                fontSize: 13,
                outline: "none"
              }}
            />
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: theme.dim }}>⊙</span>
          </div>
          {["all", "kit-ready", "analyzed", "contacted", "new"].map((item) => {
            const label = {
              all: "Todos",
              "kit-ready": "Kit listo",
              analyzed: "Analizados",
              contacted: "Contactados",
              new: "Nuevos"
            }[item];

            return (
              <button
                key={item}
                onClick={() => setFilter(item)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 500,
                  background: filter === item ? theme.accentBg : "rgba(255,255,255,0.04)",
                  color: filter === item ? theme.accent : theme.muted,
                  border: `1px solid ${filter === item ? theme.accentBorder : theme.border}`
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px,1fr))", gap: 12 }}>
          {filtered.map((prospect) => (
            <ProspectCard key={prospect.id} prospect={prospect} onOpen={onOpenProspect} />
          ))}
        </div>
        {!filtered.length ? <div style={{ textAlign: "center", padding: "60px 0", color: theme.muted, fontSize: 14 }}>No se encontraron prospectos.</div> : null}
      </div>

      {showModal ? (
        <NewProspectModal
          busy={busy}
          onClose={() => setShowModal(false)}
          onAdd={async (form) => {
            await onCreate(form);
            setShowModal(false);
          }}
        />
      ) : null}
    </div>
  );
}
