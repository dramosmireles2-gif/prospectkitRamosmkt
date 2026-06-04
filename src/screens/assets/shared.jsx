// Colores oficiales RMKT
export const R = {
  bg:     "#0a0a0f",
  accent: "#00ff88",
  yellow: "#ffbb44",
  blue:   "#4a9eff",
  red:    "#ff4455",
  purple: "#9966ff",
  text:   "#f0f0f0",
  muted:  "rgba(255,255,255,0.45)",
  dim:    "rgba(255,255,255,0.22)",
  border: "rgba(255,255,255,0.08)",
};

export const FORMATS = [
  { id: "landscape", label: "Landscape", w: 1200, h: 630 },
  { id: "square",    label: "Square",    w: 1080, h: 1080 },
  { id: "story",     label: "Story",     w: 1080, h: 1920 },
];

export const BASE = {
  width: "100%", height: "100%",
  background: R.bg, color: R.text,
  fontFamily: "'DM Sans', system-ui, sans-serif",
  overflow: "hidden", position: "relative",
};

// Branding RamosMKT — siempre presente en templates
// variant "horizontal" = logo completo | "isotipo" = solo símbolo
export function Brand({ size = "md" }) {
  const h = size === "sm" ? 22 : size === "lg" ? 40 : 30;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <img src="/logo-isotipo-color.png" alt="RMKT" style={{ height: h, width: h, objectFit: "contain", flexShrink: 0 }} />
      <img src="/logo-horizontal.png" alt="RamosMKT Growth" style={{ height: h * 0.7, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
    </div>
  );
}

// CTA pill button
export function CTABadge({ text }) {
  return (
    <div style={{ display: "inline-block", padding: "10px 24px", borderRadius: 8, background: R.accent, color: "#000", fontWeight: 800, fontSize: 14, letterSpacing: "0.02em" }}>
      {text}
    </div>
  );
}

// Glow radial decorativo
export function Glow({ color = R.accent, top, right, bottom, left, size = 320 }) {
  return (
    <div style={{ position: "absolute", top, right, bottom, left, width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle, ${color}09 0%, transparent 65%)`, pointerEvents: "none" }} />
  );
}

// Imagen con fallback placeholder
export function ProjectImage({ src, style, alt = "" }) {
  if (src) return <img src={src} alt={alt} style={{ objectFit: "cover", ...style }} />;
  return <div style={{ background: "rgba(255,255,255,0.04)", border: `1px dashed ${R.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: R.dim, fontSize: 12, ...style }}>Sin imagen</div>;
}
