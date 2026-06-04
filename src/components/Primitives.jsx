import { useEffect, useState } from "react";
import { opportunityConfig, statusConfig, theme } from "../app/theme";
import { getInitials } from "../utils/format";
import { TEMPERATURE_CONFIG, LIKELIHOOD_CONFIG } from "../services/heuristics";
import { useIsMobile } from "../hooks/useIsMobile";

export function Badge({ status }) {
  const config = statusConfig[status] || { label: status, color: "#666666", bg: "rgba(100,100,100,0.1)" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 20,
        background: config.bg,
        color: config.color,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap"
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: config.color, flexShrink: 0 }} />
      {config.label}
    </span>
  );
}

export function TemperatureBadge({ temperature, size = "md" }) {
  const t = temperature || "frio";
  const config = TEMPERATURE_CONFIG[t] || TEMPERATURE_CONFIG.frio;
  const pad = size === "sm" ? "2px 8px" : "3px 10px";
  const fs = size === "sm" ? 11 : 12;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: pad, borderRadius: 20, background: config.bg, border: `1px solid ${config.color}33`, fontSize: fs, fontWeight: 600, color: config.color, whiteSpace: "nowrap" }}>
      <span style={{ fontSize: fs - 1 }}>{config.dot}</span>
      {config.label}
    </span>
  );
}

export function LikelihoodBar({ score, showLabel = true }) {
  const s = score || 0;
  const color = LIKELIHOOD_CONFIG.color(s);
  const label = LIKELIHOOD_CONFIG.label(s);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {showLabel && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: theme.muted }}>Sales Likelihood</span>
          <span style={{ fontSize: 12, fontWeight: 700, color }}>{s}<span style={{ color: theme.muted, fontWeight: 400 }}>/100</span></span>
        </div>
      )}
      <div style={{ height: 5, borderRadius: 3, background: theme.s3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${s}%`, background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>
      {showLabel && <span style={{ fontSize: 10, color, fontWeight: 600 }}>{label}</span>}
    </div>
  );
}

export function Card({ children, style, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: theme.s2,
        border: `1px solid ${hovered && onClick ? theme.borderStrong : theme.border}`,
        borderRadius: 12,
        padding: 20,
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 120ms ease, transform 120ms ease",
        transform: hovered && onClick ? "translateY(-1px)" : "translateY(0)",
        ...style
      }}
    >
      {children}
    </div>
  );
}

export function Button({ variant = "primary", size = "md", children, onClick, disabled, style, type = "button" }) {
  const [hovered, setHovered] = useState(false);
  const padding = { sm: "6px 12px", md: "9px 16px", lg: "12px 22px" }[size];
  const fontSize = { sm: 12, md: 13, lg: 14 }[size];
  const styles = {
    primary: { background: hovered ? "#00e87a" : theme.accent, color: "#000000", fontWeight: 700 },
    secondary: {
      background: hovered ? theme.s3 : theme.s2,
      color: theme.text,
      fontWeight: 500,
      border: `1px solid ${theme.border}`
    },
    ghost: { background: "transparent", color: hovered ? theme.text : theme.muted, fontWeight: 500 },
    accent: {
      background: hovered ? "rgba(0,255,136,0.15)" : theme.accentBg,
      color: theme.accent,
      fontWeight: 600,
      border: `1px solid ${theme.accentBorder}`
    },
    danger: {
      background: hovered ? "rgba(255,68,85,0.18)" : theme.redBg,
      color: theme.red,
      fontWeight: 600,
      border: "1px solid rgba(255,68,85,0.2)"
    }
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 9,
        padding,
        fontSize,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        border: "none",
        transition: "all 120ms ease",
        ...styles,
        ...style
      }}
    >
      {children}
    </button>
  );
}

export function TopBar({ title, crumb, actions }) {
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        minHeight: isMobile ? 72 : 58,
        borderBottom: `1px solid ${theme.border}`,
        display: "flex",
        alignItems: isMobile ? "flex-start" : "center",
        flexWrap: isMobile ? "wrap" : "nowrap",
        padding: isMobile ? "12px 16px" : "0 28px",
        gap: 16,
        flexShrink: 0,
        background: theme.bg
      }}
    >
      <div style={{ flex: 1 }}>
        {crumb ? (
          <div style={{ fontSize: 11, color: theme.dim, marginBottom: 2, letterSpacing: "0.04em" }}>{crumb}</div>
        ) : null}
        <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, letterSpacing: "-0.01em" }}>{title}</div>
      </div>
      {actions ? <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>{actions}</div> : null}
    </div>
  );
}

export function Tag({ children, color }) {
  const resolved = color || theme.muted;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 6,
        background: `${resolved}18`,
        color: resolved,
        border: `1px solid ${resolved}30`,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase"
      }}
    >
      {children}
    </span>
  );
}

export function Metric({ label, value, sub, accent }) {
  return (
    <Card style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: accent ? theme.accent : theme.text,
          letterSpacing: "-0.03em",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1
        }}
      >
        {value}
      </div>
      {sub ? <div style={{ fontSize: 12, color: "#00bb66", marginTop: 8 }}>{sub}</div> : null}
    </Card>
  );
}

export function ScoreRing({ value, size = 76 }) {
  const radius = size / 2 - 7;
  const circumference = 2 * Math.PI * radius;
  const dash = (value / 100) * circumference;
  const color = value >= 70 ? theme.accent : value >= 50 ? theme.yellow : theme.red;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={theme.border} strokeWidth={6} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={17}
        fontWeight="800"
      >
        {value}
      </text>
    </svg>
  );
}

function NavItem({ id, label, icon, indent, active, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onClick(id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        borderRadius: 8,
        marginBottom: 2,
        padding: indent ? "7px 10px 7px 26px" : "7px 10px",
        background: active ? theme.accentBg : hovered ? "rgba(255,255,255,0.04)" : "transparent",
        color: active ? theme.accent : hovered ? theme.text : theme.muted,
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 100ms ease"
      }}
    >
      <span style={{ flexShrink: 0, opacity: active ? 1 : 0.65 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {active ? <span style={{ width: 4, height: 4, borderRadius: "50%", background: theme.accent, flexShrink: 0 }} /> : null}
    </div>
  );
}

export function Sidebar({ view, setView, prospect, profile, workspace, onSignOut, isMobile = false, prospects = [], onOpenProspect }) {
  const [q, setQ] = useState("");
  const navigation = [
    { id: "dashboard", label: "Dashboard",     icon: "▦" },
    { id: "prospects", label: "Prospectos",    icon: "◉" },
    { id: "pipeline",  label: "Pipeline",      icon: "⬦" },
    { id: "attack",    label: "Plan de Ataque",icon: "⚡" }
  ];

  const prospectNav = prospect
    ? [
        { id: "detail",   label: "Ficha",    icon: "□" },
        { id: "analysis", label: "Análisis", icon: opportunityConfig.web.icon },
        { id: "roi",      label: "ROI",      icon: "₿" },
        { id: "ltv",      label: "LTV",      icon: "📈" },
        { id: "gap",      label: "Brecha",   icon: "⚖" },
        { id: "kitgen",   label: "Kit",      icon: "✦" },
        { id: "assets",   label: "Assets",   icon: "▣" },
        { id: "proposal", label: "Propuesta", icon: "📄" }
      ]
    : [];

  if (isMobile) {
    return (
      <div
        style={{
          width: "100%",
          display: "block",
          flexShrink: 0,
          minHeight: 82,
          boxSizing: "border-box",
          padding: "8px 10px calc(env(safe-area-inset-bottom, 0px) + 10px)",
          background: "rgba(10,10,10,0.94)",
          borderTop: `1px solid ${theme.border}`,
          backdropFilter: "blur(18px)",
          zIndex: 100
        }}
      >
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
            padding: 6,
            background: theme.s1,
            border: `1px solid ${theme.border}`,
            borderRadius: 18,
            boxShadow: "0 -8px 24px rgba(0,0,0,0.28)"
          }}
        >
          {navigation.map((item) => {
            const active = view === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setView(item.id)}
                style={{
                  minHeight: 54,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  cursor: "pointer",
                  color: active ? theme.accent : theme.muted,
                  background: active ? "linear-gradient(180deg, rgba(0,255,136,0.14) 0%, rgba(0,255,136,0.07) 100%)" : "transparent",
                  border: active ? `1px solid ${theme.accentBorder}` : "1px solid transparent",
                  borderRadius: 14,
                  transition: "all 120ms ease"
                }}
              >
                <span style={{ fontSize: 17, lineHeight: 1, opacity: active ? 1 : 0.8 }}>{item.icon}</span>
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, lineHeight: 1 }}>
                  {item.id === "attack" ? "Ataque" : item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: theme.sidebarW,
        flexShrink: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: theme.s1,
        borderRight: `1px solid ${theme.border}`,
        padding: "14px 10px",
        overflowY: "auto"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px 18px" }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: theme.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 13,
            color: "#000",
            letterSpacing: "-0.04em",
            flexShrink: 0
          }}
        >
          R
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, lineHeight: 1.2 }}>ProspectKit</div>
          <div style={{ fontSize: 10, color: theme.dim, lineHeight: 1 }}>{workspace?.name || "by RamosMKT"}</div>
        </div>
      </div>

      {navigation.map((item) => (
        <NavItem key={item.id} {...item} active={view === item.id} onClick={setView} />
      ))}

      {prospects.length > 0 && (
        <div style={{ marginTop: 12, position: "relative" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar prospecto..."
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              padding: "8px 12px",
              color: theme.text,
              fontSize: 12,
              outline: "none",
              boxSizing: "border-box"
            }}
          />
          {q.length >= 2 && (() => {
            const results = prospects.filter((p) =>
              (p.name || "").toLowerCase().includes(q.toLowerCase()) ||
              (p.industry || "").toLowerCase().includes(q.toLowerCase())
            ).slice(0, 5);
            if (!results.length) return null;
            return (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 200,
                  background: theme.s1,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                  marginTop: 4,
                  overflow: "hidden"
                }}
              >
                {results.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onOpenProspect?.(p);
                      setQ("");
                    }}
                    style={{
                      padding: "9px 12px",
                      cursor: "pointer",
                      borderBottom: `1px solid ${theme.border}`
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = theme.s2; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: theme.muted }}>{p.industry}{p.city ? ` · ${p.city}` : ""}</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {prospect ? (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              fontSize: 10,
              color: theme.dim,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 700,
              padding: "0 10px 6px"
            }}
          >
            {prospect.name.length > 18 ? `${prospect.name.slice(0, 17)}…` : prospect.name}
          </div>
          {prospectNav.map((item) => (
            <NavItem key={item.id} {...item} indent active={view === item.id} onClick={setView} />
          ))}
        </div>
      ) : null}

      <div style={{ flex: 1 }} />

      <div
        style={{
          padding: "10px",
          borderRadius: 8,
          background: theme.s2,
          border: `1px solid ${theme.border}`,
          display: "flex",
          alignItems: "center",
          gap: 10
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: theme.accentBg,
            border: `1px solid ${theme.accentBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 800,
            color: theme.accent,
            flexShrink: 0
          }}
        >
          {getInitials(profile?.fullName || "RM")}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: theme.text,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {profile?.fullName || "Usuario"}
          </div>
          <div style={{ fontSize: 10, color: theme.dim }}>{workspace?.slug || "owner"}</div>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onSignOut} style={{ marginTop: 10, justifyContent: "flex-start" }}>
        Cerrar sesión
      </Button>
    </div>
  );
}

export function EmptyState({ title, description, actions }) {
  return (
    <Card
      style={{
        minHeight: 260,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 28
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 14, color: theme.muted, lineHeight: 1.7, marginBottom: 18 }}>{description}</div>
        {actions ? <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>{actions}</div> : null}
      </div>
    </Card>
  );
}

export function Field({ label, value, onChange, placeholder, textarea, rows = 4, type = "text", error, autoComplete }) {
  const hasError = Boolean(error);
  const sharedStyle = {
    background: theme.s3,
    border: `1px solid ${hasError ? "rgba(255,68,85,0.4)" : theme.border}`,
    borderRadius: 8,
    padding: "10px 12px",
    color: theme.text,
    fontSize: 13,
    outline: "none",
    width: "100%"
  };

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 11, color: hasError ? theme.red : theme.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          rows={rows}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={{ ...sharedStyle, resize: "none", minHeight: 96 }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={sharedStyle}
        />
      )}
      {hasError ? <span style={{ fontSize: 11, color: theme.red, marginTop: -2 }}>{error}</span> : null}
    </label>
  );
}

export function ModalFrame({ title, description, onClose, children }) {
  const isMobile = useIsMobile();

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: isMobile ? 12 : 20
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          background: theme.s2,
          border: `1px solid ${theme.borderStrong}`,
          borderRadius: isMobile ? 18 : 14,
          width: isMobile ? "100%" : 520,
          maxWidth: "100%",
          maxHeight: isMobile ? "88vh" : "90vh",
          overflowY: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)"
        }}
      >
        <div
          style={{
            padding: isMobile ? "18px" : "20px 24px",
            borderBottom: `1px solid ${theme.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>{title}</div>
            {description ? <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{description}</div> : null}
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: theme.muted, fontSize: 18 }}>
            ×
          </button>
        </div>
        <div style={{ padding: isMobile ? 18 : 24 }}>{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = "Confirmar", onConfirm, onCancel }) {
  const isMobile = useIsMobile();

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: isMobile ? 12 : 20
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        style={{
          background: theme.s2,
          border: `1px solid ${theme.borderStrong}`,
          borderRadius: isMobile ? 18 : 14,
          padding: isMobile ? 18 : 24,
          width: isMobile ? "100%" : 380,
          maxWidth: "100%",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)"
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 13, color: theme.muted, lineHeight: 1.6, marginBottom: 20 }}>{message}</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: isMobile ? "wrap" : "nowrap" }}>
          <Button variant="secondary" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

export function Toast({ tone = "success", message, onClose, duration = 3500 }) {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const color = tone === "error" ? theme.red : theme.accent;
  const bg = tone === "error" ? theme.redBg : theme.accentBg;
  return (
    <div
      style={{
        position: "fixed",
        right: isMobile ? 12 : 20,
        left: isMobile ? 12 : "auto",
        bottom: isMobile ? 72 : 20,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 10,
        background: bg,
        border: `1px solid ${tone === "error" ? "rgba(255,68,85,0.25)" : theme.accentBorder}`,
        color,
        minWidth: isMobile ? "auto" : 260,
        zIndex: 1200,
        animation: "fadeIn 200ms ease"
      }}
    >
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{message}</span>
      <button onClick={onClose} style={{ background: "transparent", border: "none", color, cursor: "pointer" }}>
        ×
      </button>
    </div>
  );
}
