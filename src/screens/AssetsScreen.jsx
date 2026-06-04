import { useState } from "react";
import { theme } from "../app/theme";
import { FORMATS } from "./assets/shared";
import { ProspectingTab } from "./assets/ProspectingTab";
import { ProposalTab } from "./assets/ProposalTab";
import { ShowcaseTab } from "./assets/ShowcaseTab";

const TABS = [
  { id: "prospecting", label: "Prospecting",       desc: "Aumentar respuestas" },
  { id: "proposal",    label: "Proposal",           desc: "Cerrar ventas" },
  { id: "showcase",    label: "Project Showcase",   desc: "Promocionar proyectos" },
];

export function AssetsScreen({ prospect, proposals = [] }) {
  const [tab, setTab] = useState("prospecting");
  const [formatId, setFormatId] = useState("landscape");
  const fmt = FORMATS.find(f => f.id === formatId) || FORMATS[0];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header with tabs */}
      <div style={{ borderBottom: `1px solid ${theme.border}`, background: theme.bg, flexShrink: 0 }}>
        <div style={{ height: 58, display: "flex", alignItems: "center", padding: "0 28px", gap: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Assets</div>
          <div style={{ flex: 1 }} />
          {/* Format selector */}
          <div style={{ display: "flex", gap: 4 }}>
            {FORMATS.map(f => (
              <button
                key={f.id}
                onClick={() => setFormatId(f.id)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: formatId === f.id ? 700 : 400,
                  cursor: "pointer",
                  background: formatId === f.id ? theme.accentBg : "transparent",
                  color: formatId === f.id ? theme.accent : theme.muted,
                  border: `1px solid ${formatId === f.id ? theme.accentBorder : theme.border}`
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {/* Tab bar */}
        <div style={{ display: "flex", padding: "0 28px", gap: 2 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px 8px 0 0",
                fontSize: 13,
                fontWeight: tab === t.id ? 700 : 400,
                cursor: "pointer",
                background: tab === t.id ? theme.s2 : "transparent",
                color: tab === t.id ? theme.accent : theme.muted,
                border: `1px solid ${tab === t.id ? theme.border : "transparent"}`,
                borderBottom: tab === t.id ? `1px solid ${theme.s2}` : `1px solid ${theme.border}`,
                marginBottom: -1
              }}
            >
              {t.label}
              {t.id === "showcase" && (
                <span style={{ marginLeft: 6, fontSize: 9, padding: "1px 5px", borderRadius: 10, background: "rgba(0,255,136,0.15)", color: theme.accent }}>
                  PRINCIPAL
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {tab === "prospecting" && <ProspectingTab prospect={prospect} proposals={proposals} format={fmt} />}
        {tab === "proposal"    && <ProposalTab prospect={prospect} proposals={proposals} format={fmt} />}
        {tab === "showcase"    && <ShowcaseTab format={fmt} />}
      </div>
    </div>
  );
}
