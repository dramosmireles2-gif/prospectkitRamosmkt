import { useState } from "react";
import { SERVICE_CATALOG, getWorkspaceCatalog, saveWorkspaceCatalog, resetWorkspaceCatalog } from "../services/serviceCatalog";
import { R } from "../screens/assets/shared";

const TYPE_LABELS = {
  unico: "Pago único",
  mensual: "Mensual",
  "setup+mensual": "Setup + mensual",
  anual: "Anual",
};

export function CatalogEditor({ workspaceId, onClose, onSaved }) {
  const current = getWorkspaceCatalog(workspaceId);
  const [rows, setRows] = useState(
    current.map(item => ({
      id: item.id,
      service: item.service,
      icon: item.icon,
      type: item.type,
      price: String(item.price),
      setupPrice: String(item.setupPrice || 0),
    }))
  );
  const [saved, setSaved] = useState(false);

  function update(id, field, value) {
    setRows(r => r.map(row => row.id === id ? { ...row, [field]: value } : row));
  }

  function handleSave() {
    const overrides = {};
    rows.forEach(row => {
      const original = SERVICE_CATALOG.find(s => s.id === row.id);
      const price = parseInt(row.price, 10) || 0;
      const setupPrice = parseInt(row.setupPrice, 10) || 0;
      if (price !== original.price || setupPrice !== (original.setupPrice || 0)) {
        overrides[row.id] = { price, setupPrice };
      }
    });
    saveWorkspaceCatalog(workspaceId, overrides);
    setSaved(true);
    setTimeout(() => { setSaved(false); onSaved?.(); onClose?.(); }, 800);
  }

  function handleReset() {
    resetWorkspaceCatalog(workspaceId);
    setRows(SERVICE_CATALOG.map(item => ({
      id: item.id, service: item.service, icon: item.icon,
      type: item.type, price: String(item.price), setupPrice: String(item.setupPrice || 0),
    })));
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, width: 620, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0" }}>Catálogo de servicios</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Edita los precios base que aparecen en cada propuesta nueva</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 20, cursor: "pointer", padding: "4px 8px" }}>✕</button>
        </div>

        {/* Table */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Servicio</th>
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Tipo</th>
                <th style={{ padding: "10px 16px", textAlign: "right", fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Precio $</th>
                <th style={{ padding: "10px 16px", textAlign: "right", fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Setup $</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{row.icon}</span>
                      <span style={{ fontSize: 13, color: "#f0f0f0", fontWeight: 500 }}>{row.service}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: 4 }}>
                      {TYPE_LABELS[row.type] || row.type}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <input
                      type="number"
                      value={row.price}
                      onChange={e => update(row.id, "price", e.target.value)}
                      style={{ width: 90, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "5px 10px", color: "#f0f0f0", fontSize: 13, textAlign: "right", outline: "none" }}
                    />
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {row.type === "setup+mensual"
                      ? <input
                          type="number"
                          value={row.setupPrice}
                          onChange={e => update(row.id, "setupPrice", e.target.value)}
                          style={{ width: 90, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "5px 10px", color: "#f0f0f0", fontSize: 13, textAlign: "right", outline: "none" }}
                        />
                      : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={handleReset} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer" }}>
            Restaurar precios originales
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer" }}>
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{ background: saved ? "#16a34a" : R.accent, border: "none", borderRadius: 8, padding: "8px 20px", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            {saved ? "Guardado ✓" : "Guardar precios"}
          </button>
        </div>
      </div>
    </div>
  );
}
