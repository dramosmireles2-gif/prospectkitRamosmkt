import { useRef, useState } from "react";
import { Button } from "../../components/Primitives";
import { useAssetExport } from "./useAssetExport";
import { R, BASE, FORMATS, Brand, Glow } from "./shared";
import { PROJECT_TYPES, detectProjectType } from "./constants";

const RMKT_PHONE = "8148078309";
const RMKT_PHONE_DISPLAY = "814 807 8309";
const RMKT_WA = `https://wa.me/52${RMKT_PHONE}`;

const TEMPLATES = [
  { id: "flyer-oscuro", label: "Flyer Oscuro", desc: "Fondo negro, copy de impacto" },
  { id: "flyer-claro",  label: "Flyer Claro",  desc: "Fondo blanco, estilo limpio" },
];

// Mapa de gaps del análisis → bullets visuales para el flyer
const GAP_BULLET_MAP = {
  "Sitio web":           { icon: "🌐", accent: "Sitio web profesional", rest: " que vende incluso de noche." },
  "Sitio responsivo":    { icon: "📱", accent: "Sitio optimizado", rest: " para celular y tablet." },
  "Google My Business":  { icon: "📍", accent: "Google Maps activo", rest: " para que te encuentren local." },
  "WhatsApp integrado":  { icon: "💬", accent: "WhatsApp directo", rest: " para cerrar ventas al instante." },
  "WhatsApp profesional":{ icon: "💬", accent: "WhatsApp Business", rest: " con respuestas automáticas." },
  "Meta Ads activos":    { icon: "📣", accent: "Publicidad en Meta", rest: " para atraer clientes nuevos." },
  "Instagram activo":    { icon: "📸", accent: "Presencia en Instagram", rest: " con contenido que conecta." },
  "Contenido activo":    { icon: "🎯", accent: "Contenido constante", rest: " que posiciona tu marca." },
  "Sistema de citas":    { icon: "📅", accent: "Agenda online", rest: " para reservas sin llamadas." },
  "Sistema de reservas": { icon: "📅", accent: "Sistema de reservas", rest: " automático 24/7." },
  "Menu digital":        { icon: "📲", accent: "Menú digital", rest: " accesible desde cualquier celular." },
  "CRM de leads":        { icon: "🗂️", accent: "CRM de clientes", rest: " para no perder ningún contacto." },
};

// Genera bullets dinámicos priorizando los gaps reales del análisis
function buildDynamicBullets(prospect, ptype) {
  const missing = prospect?.analysis?.missingFeatures || [];
  const fromAnalysis = missing
    .filter(f => GAP_BULLET_MAP[f.name])
    .slice(0, 3)
    .map(f => GAP_BULLET_MAP[f.name]);

  const merged = [...fromAnalysis];
  for (const b of (ptype.bullets || [])) {
    if (merged.length >= 3) break;
    if (!merged.find(m => m.accent === b.accent)) merged.push(b);
  }
  return merged.slice(0, 3);
}

// Resumen de por qué el flyer tiene ese enfoque
function buildFlyerRationale(prospect) {
  const missing = prospect?.analysis?.missingFeatures || [];
  const critical = missing.filter(f => f.critical).slice(0, 2);
  const rest = missing.filter(f => !f.critical).slice(0, 1);
  return [...critical, ...rest].filter(f => GAP_BULLET_MAP[f.name]);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function HookText({ hook, accent, dark = true }) {
  const color = dark ? "#ffffff" : "#111111";
  const lines = hook.split("\n");
  return (
    <div style={{ lineHeight: 1.05 }}>
      {lines.map((line, i) => {
        const isAccent = line.toUpperCase().includes(accent.toUpperCase());
        return (
          <div key={i} style={{ fontSize: "inherit", fontWeight: 900, color: isAccent ? R.accent : color, letterSpacing: "-0.03em" }}>
            {line}
          </div>
        );
      })}
    </div>
  );
}

function BulletItem({ icon, accent, rest, dark = true }) {
  const textColor = dark ? "rgba(255,255,255,0.85)" : "#333333";
  const accentColor = dark ? R.accent : "#16a34a";
  const bgColor = dark ? "rgba(0,255,136,0.1)" : "#f0fdf4";
  const borderColor = dark ? "rgba(0,255,136,0.2)" : "#bbf7d0";
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: bgColor, border: `1px solid ${borderColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ fontSize: 15, color: textColor, lineHeight: 1.4, paddingTop: 6 }}>
        <span style={{ fontWeight: 700, color: accentColor }}>{accent}</span>{rest}
      </div>
    </div>
  );
}

function WACta({ dark = true }) {
  const bg = dark ? "rgba(37,211,102,0.12)" : "#f0fdf4";
  const border = dark ? "rgba(37,211,102,0.3)" : "#bbf7d0";
  const textColor = dark ? "#f0f0f0" : "#111111";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", background: bg, border: `1px solid ${border}`, borderRadius: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: textColor }}>Agenda una asesoría sin compromiso</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#25d366", letterSpacing: "0.02em" }}>{RMKT_PHONE_DISPLAY}</div>
      </div>
    </div>
  );
}

function ServiceFooter({ dark = true }) {
  const color = dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)";
  const accentColor = dark ? R.accent : "#16a34a";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 11, color, letterSpacing: "0.06em", textTransform: "uppercase" }}>
      <span>Diseño Web</span>
      <span style={{ color: accentColor }}>·</span>
      <span>Redes Sociales</span>
      <span style={{ color: accentColor }}>·</span>
      <span>Apps</span>
    </div>
  );
}

// ─── Templates ─────────────────────────────────────────────────────────────────

function FlyerOscuro({ ptype, bullets, photoSrc, format }) {
  const isStory = format?.id === "story";
  const isSquare = format?.id === "square";
  const isLandscape = format?.id === "landscape";
  const hookSize = isStory ? 72 : isSquare ? 64 : 52;

  if (isLandscape) {
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "row", background: "linear-gradient(135deg, #0a0a0f 60%, #0d1a12 100%)" }}>
        <Glow color={R.accent} top={-100} left={-100} size={500} />
        <div style={{ flex: 1.2, display: "flex", flexDirection: "column", padding: "36px 48px", gap: 18, zIndex: 1 }}>
          {/* Logo más grande, alineado izquierda */}
          <div style={{ alignSelf: "flex-start" }}>
            <Brand size="lg" />
          </div>
          <div style={{ fontSize: hookSize }}>
            <HookText hook={ptype.hook} accent={ptype.hookAccent} dark />
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, maxWidth: 380 }}>
            {ptype.subheadline.replace(/\n/g, " ")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            {bullets.map((b, i) => <BulletItem key={i} {...b} dark />)}
          </div>
          <WACta dark />
          <ServiceFooter dark />
        </div>
        <div style={{ flex: 0.8, position: "relative", overflow: "hidden" }}>
          {photoSrc
            ? <img src={photoSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: "rgba(0,255,136,0.03)", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px dashed rgba(0,255,136,0.1)" }}>
                <div style={{ textAlign: "center", color: "rgba(255,255,255,0.15)", fontSize: 13 }}>📷<br/>Foto del negocio</div>
              </div>
          }
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #0a0a0f 0%, transparent 30%)" }} />
        </div>
      </div>
    );
  }

  if (isSquare) {
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column", background: "linear-gradient(160deg, #0a0a0f 60%, #0d1a12 100%)", padding: "48px 56px" }}>
        <Glow color={R.accent} top={-80} right={-80} size={400} />
        <div style={{ marginBottom: 28, alignSelf: "flex-start" }}>
          <Brand size="lg" />
        </div>
        <div style={{ fontSize: 68, marginBottom: 20 }}>
          <HookText hook={ptype.hook} accent={ptype.hookAccent} dark />
        </div>
        <div style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, marginBottom: 28 }}>
          {ptype.subheadline.replace(/\n/g, " ")}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
          {bullets.map((b, i) => <BulletItem key={i} {...b} dark />)}
        </div>
        <WACta dark />
        <div style={{ marginTop: "auto", paddingTop: 20 }}><ServiceFooter dark /></div>
      </div>
    );
  }

  // Story
  return (
    <div style={{ ...BASE, display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #0a0a0f 50%, #0d1a12 100%)" }}>
      <Glow color={R.accent} top={-100} right={-100} size={600} />
      <div style={{ height: 680, position: "relative", overflow: "hidden", flexShrink: 0 }}>
        {photoSrc
          ? <img src={photoSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", background: "rgba(0,255,136,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.15)", fontSize: 16 }}>📷<br/>Foto del negocio</div>
            </div>
        }
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.8) 100%)" }} />
        <div style={{ position: "absolute", top: 44, left: 48 }}>
          <Brand size="lg" />
        </div>
      </div>
      <div style={{ flex: 1, padding: "40px 56px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: hookSize }}>
          <HookText hook={ptype.hook} accent={ptype.hookAccent} dark />
        </div>
        <div style={{ fontSize: 17, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
          {ptype.subheadline.replace(/\n/g, " ")}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {bullets.map((b, i) => <BulletItem key={i} {...b} dark />)}
        </div>
        <WACta dark />
        <ServiceFooter dark />
      </div>
    </div>
  );
}

function FlyerClaro({ ptype, bullets, photoSrc, format }) {
  const isStory = format?.id === "story";
  const isSquare = format?.id === "square";
  const isLandscape = format?.id === "landscape";
  const hookSize = isStory ? 72 : isSquare ? 64 : 52;

  if (isLandscape) {
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "row", background: "#ffffff" }}>
        <div style={{ flex: 1.2, display: "flex", flexDirection: "column", padding: "36px 48px", gap: 18 }}>
          <div style={{ alignSelf: "flex-start" }}>
            <Brand size="lg" />
          </div>
          <div style={{ fontSize: hookSize }}>
            <HookText hook={ptype.hook} accent={ptype.hookAccent} dark={false} />
          </div>
          <div style={{ fontSize: 15, color: "#555", lineHeight: 1.5, maxWidth: 380 }}>
            {ptype.subheadline.replace(/\n/g, " ")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            {bullets.map((b, i) => <BulletItem key={i} {...b} dark={false} />)}
          </div>
          <div style={{ background: "#14532d", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Solicita información</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#25d366" }}>{RMKT_PHONE_DISPLAY}</div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Diseño Web · Redes Sociales · Apps</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 0.8, position: "relative", overflow: "hidden" }}>
          {photoSrc
            ? <img src={photoSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center", color: "#86efac", fontSize: 13 }}>📷<br/>Foto del negocio</div>
              </div>
          }
        </div>
      </div>
    );
  }

  if (isSquare) {
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column", background: "#ffffff", padding: "48px 56px" }}>
        <div style={{ marginBottom: 24, alignSelf: "flex-start" }}>
          <Brand size="lg" />
        </div>
        <div style={{ fontSize: 68, marginBottom: 20 }}>
          <HookText hook={ptype.hook} accent={ptype.hookAccent} dark={false} />
        </div>
        <div style={{ fontSize: 16, color: "#555", lineHeight: 1.5, marginBottom: 28 }}>
          {ptype.subheadline.replace(/\n/g, " ")}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
          {bullets.map((b, i) => <BulletItem key={i} {...b} dark={false} />)}
        </div>
        <div style={{ background: "#14532d", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Solicita información</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#25d366" }}>{RMKT_PHONE_DISPLAY}</div>
          </div>
        </div>
        <div style={{ marginTop: "auto", paddingTop: 16, fontSize: 11, color: "#999", textAlign: "center", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Diseño Web · Redes Sociales · Apps
        </div>
      </div>
    );
  }

  // Story
  return (
    <div style={{ ...BASE, display: "flex", flexDirection: "column", background: "#ffffff" }}>
      <div style={{ height: 640, position: "relative", overflow: "hidden", flexShrink: 0 }}>
        {photoSrc
          ? <img src={photoSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center", color: "#86efac", fontSize: 16 }}>📷<br/>Foto del negocio</div>
            </div>
        }
        <div style={{ position: "absolute", top: 44, left: 48 }}>
          <Brand size="lg" />
        </div>
      </div>
      <div style={{ flex: 1, padding: "40px 56px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: isStory ? 72 : 52 }}>
          <HookText hook={ptype.hook} accent={ptype.hookAccent} dark={false} />
        </div>
        <div style={{ fontSize: 17, color: "#555", lineHeight: 1.5 }}>
          {ptype.subheadline.replace(/\n/g, " ")}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {bullets.map((b, i) => <BulletItem key={i} {...b} dark={false} />)}
        </div>
        <div style={{ background: "#14532d", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Solicita información <strong style={{ color: "#25d366" }}>*AHORA*:</strong></div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#25d366" }}>{RMKT_PHONE_DISPLAY}</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#aaa", textAlign: "center", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Diseño Web · Redes Sociales · Apps
        </div>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function ProspectingTab({ prospect, proposals, format }) {
  const fmt = format || FORMATS[0];
  const [templateId, setTemplateId] = useState("flyer-oscuro");
  // Foto independiente por formato
  const [photos, setPhotos] = useState({ landscape: null, square: null, story: null });
  const photoInputRef = useRef(null);

  const photoSrc = photos[fmt.id] || null;

  const slugName = (prospect?.name || "prospect").toLowerCase().replace(/\s+/g, "-");
  const baseFilename = `rmkt-prospecting-${templateId}-${slugName}`;
  const { exportRef, downloading, message, download, downloadAll } = useAssetExport({
    filename: `${baseFilename}-${fmt.id}`
  });

  // Refs para exportar los 3 formatos a la vez
  const exportRefs = {
    landscape: useRef(null),
    square: useRef(null),
    story: useRef(null),
  };

  const typeKey = detectProjectType(prospect?.industry || "", prospect?.notes || "");
  const ptype = PROJECT_TYPES[typeKey] || PROJECT_TYPES.otro;
  const bullets = buildDynamicBullets(prospect, ptype);
  const rationale = buildFlyerRationale(prospect);

  // Hook personalizado de IA si existe, si no el estático por industria
  const flyerHook = prospect?.analysis?.flyerHook || ptype.hook;
  const flyerHookAccent = prospect?.analysis?.flyerHookAccent || ptype.hookAccent;
  const flyerSubheadline = prospect?.analysis?.flyerSubheadline || ptype.subheadline;

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotos(p => ({ ...p, [fmt.id]: ev.target.result }));
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function removePhoto() {
    setPhotos(p => ({ ...p, [fmt.id]: null }));
  }

  const previewScale = Math.min(600 / fmt.w, 400 / fmt.h);
  const previewW = Math.round(fmt.w * previewScale);
  const previewH = Math.round(fmt.h * previewScale);

  function renderTemplate(id, overrideFmt, overridePhoto) {
    const f = overrideFmt || fmt;
    const photo = overridePhoto !== undefined ? overridePhoto : photoSrc;
    const flyerPtype = { ...ptype, hook: flyerHook, hookAccent: flyerHookAccent, subheadline: flyerSubheadline };
    if (id === "flyer-oscuro") return <FlyerOscuro ptype={flyerPtype} bullets={bullets} photoSrc={photo} format={f} />;
    if (id === "flyer-claro")  return <FlyerClaro  ptype={flyerPtype} bullets={bullets} photoSrc={photo} format={f} />;
    return null;
  }

  const fmtLabel = { landscape: "Landscape", square: "Square", story: "Story" };

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.07)", overflowY: "auto", padding: "16px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        {/* Industry badge */}
        <div style={{ padding: "8px 12px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 8, marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>Industria detectada</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: R.accent }}>{ptype.label}</div>
        </div>

        {/* Photo upload por formato */}
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, padding: "4px 4px 2px" }}>
          Foto — {fmtLabel[fmt.id]}
        </div>
        <div
          onClick={() => photoInputRef.current?.click()}
          style={{ padding: "10px 12px", borderRadius: 8, border: "1px dashed rgba(255,255,255,0.15)", cursor: "pointer", textAlign: "center", background: "rgba(255,255,255,0.02)" }}
        >
          {photoSrc
            ? <img src={photoSrc} alt="" style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6 }} />
            : <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "8px 0" }}>+ Subir foto</div>
          }
        </div>
        {photoSrc && (
          <button onClick={removePhoto} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 8px", color: "rgba(255,255,255,0.35)", fontSize: 10, cursor: "pointer" }}>
            Quitar foto
          </button>
        )}
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", padding: "2px 4px" }}>
          Cada formato tiene su propia foto
        </div>
        <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />

        {/* Templates */}
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, padding: "10px 4px 2px" }}>Plantillas</div>
        {TEMPLATES.map(t => (
          <div
            key={t.id}
            onClick={() => setTemplateId(t.id)}
            style={{ padding: "10px 13px", borderRadius: 9, cursor: "pointer", background: templateId === t.id ? "rgba(0,255,136,0.08)" : "transparent", border: `1px solid ${templateId === t.id ? "rgba(0,255,136,0.25)" : "transparent"}` }}
          >
            <div style={{ fontSize: 12, fontWeight: templateId === t.id ? 700 : 500, color: templateId === t.id ? R.accent : "rgba(255,255,255,0.7)", marginBottom: 2 }}>{t.label}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{t.desc}</div>
          </div>
        ))}

        {/* Justificación del enfoque (solo si hay análisis) */}
        {rationale.length > 0 && (
          <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.1)", borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>¿Por qué este enfoque?</div>
            {rationale.map((f, i) => (
              <div key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 3, lineHeight: 1.4 }}>
                <span style={{ color: R.accent }}>·</span> Sin {f.name.toLowerCase()} detectado
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#060606", padding: 28 }}>
          <div style={{ width: previewW, height: previewH, overflow: "hidden", borderRadius: 10, boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)" }}>
            <div style={{ width: fmt.w, height: fmt.h, transform: `scale(${previewScale})`, transformOrigin: "top left" }}>
              {renderTemplate(templateId)}
            </div>
          </div>
        </div>

        <div style={{ minHeight: 66, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: "0 24px", gap: 12, background: "#0a0a0f", flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
              {TEMPLATES.find(t => t.id === templateId)?.label} · {fmt.label}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              {downloading ? (message || "Generando...") : `${fmt.w}×${fmt.h} px · ${ptype.label}`}
            </div>
          </div>
          <Button variant="secondary" size="md" onClick={() => download("png", fmt.w, fmt.h)} disabled={downloading}>
            PNG
          </Button>
          <Button variant="secondary" size="md" onClick={() => download("jpg", fmt.w, fmt.h)} disabled={downloading}>
            JPG
          </Button>
          <Button variant="primary" size="md" onClick={() => downloadAll(exportRefs, FORMATS, baseFilename)} disabled={downloading}>
            ZIP · 3 formatos
          </Button>
        </div>
      </div>

      {/* Off-screen export canvas — formato activo */}
      <div style={{ position: "fixed", left: -9999, top: 0, width: fmt.w, height: fmt.h, pointerEvents: "none" }}>
        <div ref={exportRef} style={{ width: fmt.w, height: fmt.h }}>
          {renderTemplate(templateId)}
        </div>
      </div>

      {/* Off-screen renders para ZIP — uno por formato */}
      {FORMATS.map(f => (
        <div key={f.id} style={{ position: "fixed", left: -9999, top: 0, width: f.w, height: f.h, pointerEvents: "none" }}>
          <div ref={exportRefs[f.id]} style={{ width: f.w, height: f.h }}>
            {renderTemplate(templateId, f, photos[f.id])}
          </div>
        </div>
      ))}
    </div>
  );
}
