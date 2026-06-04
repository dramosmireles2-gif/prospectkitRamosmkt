import { useRef, useState } from "react";
import { theme } from "../../app/theme";
import { Button } from "../../components/Primitives";
import { useAssetExport } from "./useAssetExport";
import { R, BASE, Brand, Glow, CTABadge } from "./shared";
import { PROJECT_TYPES, detectProjectType } from "./constants";

const STORAGE_KEY = "rmkt_showcase_projects";

function loadProjects() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

const TEMPLATES = [
  { id: "service-promo",      label: "Service Promo",       desc: "Flyer de servicio con hook" },
  { id: "industry-flyer",     label: "Industry Flyer",      desc: "Flyer por industria" },
  { id: "feature-flyer",      label: "Feature Flyer",       desc: "Feature principal del proyecto" },
  { id: "before-after",       label: "Before / After",      desc: "Transformación digital" },
  { id: "mockup-showcase",    label: "Mockup Showcase",     desc: "Estilo Behance/Dribbble" },
  { id: "mkt-carousel-1",     label: "Carousel 1/6",        desc: "Portada del proyecto" },
  { id: "mkt-carousel-2",     label: "Carousel 2/6",        desc: "El problema" },
  { id: "mkt-carousel-3",     label: "Carousel 3/6",        desc: "La solución" },
  { id: "mkt-carousel-4",     label: "Carousel 4/6",        desc: "Features" },
  { id: "mkt-carousel-5",     label: "Carousel 5/6",        desc: "El resultado" },
  { id: "mkt-carousel-6",     label: "Carousel 6/6",        desc: "CTA" },
  { id: "story",              label: "Story",               desc: "Historia vertical" },
  { id: "reel-cover",         label: "Reel Cover",          desc: "Thumbnail de video" },
  { id: "meta-ad",            label: "Meta Ad",             desc: "Creativo para Meta Ads" },
  { id: "linkedin-creative",  label: "LinkedIn",            desc: "Post profesional corporativo" },
  { id: "portfolio-card",     label: "Portfolio Card",      desc: "Tarjeta de portafolio" },
  { id: "case-study",         label: "Case Study",          desc: "Caso de éxito completo" },
];

function parseFeaturesArray(featuresText = "") {
  if (!featuresText) return [];
  return featuresText.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
}

function ShowcaseTemplate({ templateId, project, format }) {
  const isStory = format?.id === "story";
  const isLandscape = format?.id === "landscape";
  const { businessName = "Tu negocio", industry = "", description = "", features: featuresRaw = "", desktopImg, mobileImg } = project;
  const typeKey = detectProjectType(industry, description);
  const typeConfig = PROJECT_TYPES[typeKey];
  const features = parseFeaturesArray(featuresRaw);
  const name = businessName || "Tu negocio";
  const shortDesc = description.length > 80 ? description.slice(0, 80) + "…" : description;
  const longDesc = description.length > 160 ? description.slice(0, 160) + "…" : description;

  if (templateId === "service-promo") {
    return (
      <div style={{ ...BASE }}>
        {desktopImg && (
          <div style={{ position: "absolute", inset: 0 }}>
            <img src={desktopImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,10,15,0.75) 0%, rgba(10,10,15,0.88) 100%)" }} />
          </div>
        )}
        {!desktopImg && <Glow color={R.accent} top={-60} right={-60} size={360} />}
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "64px 56px" : "48px 64px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 20, background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)", color: R.accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Proyecto completado ✓
            </div>
            <Brand />
          </div>
          <div>
            <div style={{ fontSize: isStory ? 56 : 44, fontWeight: 900, color: R.text, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 14 }}>{typeConfig.hook}</div>
            <div style={{ fontSize: isStory ? 18 : 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 24, maxWidth: 600 }}>Desarrollamos {shortDesc || typeConfig.solution} para <strong style={{ color: R.text }}>{name}</strong></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
              {typeConfig.solution.split("+").slice(0, 3).map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: R.accent, fontWeight: 900, fontSize: 14 }}>✓</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{item.trim()}</span>
                </div>
              ))}
            </div>
            <CTABadge text={typeConfig.cta} />
          </div>
          <div style={{ fontSize: 12, color: R.dim }}>#{industry.replace(/\s+/g, "")} #RamosMKT #DesarrolloWeb</div>
        </div>
      </div>
    );
  }

  if (templateId === "industry-flyer") {
    const featureList = features.length ? features.slice(0, 4) : [typeConfig.solution];
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: isStory ? "column" : "row" }}>
        <Glow color={R.blue} top={-80} left={-80} size={400} />
        <div style={{ flex: 1, padding: isStory ? "56px 52px 28px" : "52px 56px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <Brand />
          <div>
            <div style={{ fontSize: isStory ? 44 : 36, fontWeight: 900, color: R.text, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 10 }}>
              Desarrollamos plataformas para {typeConfig.label}
            </div>
            <div style={{ fontSize: 15, color: R.muted, marginBottom: 24 }}>
              <strong style={{ color: R.text }}>{name}</strong> ya lo tiene. ¿Quieres lo mismo?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {featureList.map((feat, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: R.accent, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>
          <CTABadge text={typeConfig.cta} />
        </div>
        {desktopImg && !isStory && (
          <div style={{ flex: "0 0 400px", position: "relative", overflow: "hidden" }}>
            <img src={desktopImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(10,10,15,0.6) 0%, transparent 40%)" }} />
          </div>
        )}
        {desktopImg && isStory && (
          <div style={{ flex: "0 0 300px", position: "relative", overflow: "hidden" }}>
            <img src={desktopImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,10,15,0.6) 0%, transparent 40%)" }} />
          </div>
        )}
      </div>
    );
  }

  if (templateId === "feature-flyer") {
    const mainFeature = features[0] || typeConfig.solution;
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Glow color={R.purple} top="30%" left="50%" size={500} />
        {mobileImg && (
          <div style={{ position: "absolute", right: isStory ? "50%" : 60, top: isStory ? 200 : 40, transform: isStory ? "translateX(50%)" : "none", width: isStory ? 200 : 160, borderRadius: 20, overflow: "hidden", border: `2px solid rgba(153,102,255,0.3)`, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <img src={mobileImg} alt="" style={{ width: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "60px 52px" : "48px 64px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", maxWidth: mobileImg && !isStory ? "60%" : "100%" }}>
          <Brand />
          <div>
            <div style={{ fontSize: 11, color: R.purple, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Feature principal</div>
            <div style={{ fontSize: isStory ? 52 : 44, fontWeight: 900, color: R.text, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16 }}>{mainFeature}</div>
            <div style={{ fontSize: 16, color: R.muted }}>Implementado en <strong style={{ color: R.text }}>{name}</strong></div>
          </div>
          <div style={{ fontSize: 12, color: R.dim }}>#{typeConfig.label.replace(/\s+\/\s+/g, "").replace(/\s+/g, "")} #RamosMKT</div>
        </div>
      </div>
    );
  }

  if (templateId === "before-after") {
    const beforeBullets = typeConfig.problem.split(",").concat(["Sin automatización", "Procesos manuales"]).slice(0, 3);
    const afterBullets = typeConfig.solution.split("+").map(s => s.trim()).slice(0, 3);
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isStory ? "36px 48px 24px" : "24px 52px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div style={{ fontSize: isStory ? 32 : 26, fontWeight: 900, color: R.text, letterSpacing: "-0.02em" }}>{typeConfig.hook}</div>
          <Brand />
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: isStory ? "1fr" : "1fr 1fr", gridTemplateRows: isStory ? "1fr 1fr" : undefined }}>
          <div style={{ padding: "28px 40px", background: "rgba(255,68,85,0.04)", borderRight: isStory ? "none" : "1px solid rgba(255,68,85,0.15)", borderBottom: isStory ? "1px solid rgba(255,68,85,0.15)" : "none" }}>
            <div style={{ fontSize: 12, color: R.red, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 18 }}>Antes</div>
            {beforeBullets.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                <span style={{ color: R.red, fontWeight: 900, fontSize: 15, flexShrink: 0, lineHeight: 1.4 }}>×</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: "28px 40px", background: "rgba(0,255,136,0.04)", position: "relative" }}>
            {desktopImg && (
              <div style={{ position: "absolute", inset: 0 }}>
                <img src={desktopImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,15,0.75)" }} />
              </div>
            )}
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 12, color: R.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 18 }}>Después con RamosMKT</div>
              {afterBullets.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                  <span style={{ color: R.accent, fontWeight: 900, fontSize: 15, flexShrink: 0, lineHeight: 1.4 }}>✓</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "mockup-showcase") {
    return (
      <div style={{ ...BASE, background: "#050508" }}>
        {desktopImg && (
          <div style={{ position: "absolute", inset: isStory ? "140px 40px 200px" : "60px 60px 100px", borderRadius: 12, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.8)" }}>
            <img src={desktopImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        {mobileImg && desktopImg && (
          <div style={{ position: "absolute", right: isStory ? 80 : 60, top: isStory ? 160 : 40, width: isStory ? 120 : 100, borderRadius: 14, overflow: "hidden", border: "2px solid rgba(0,255,136,0.2)", boxShadow: "0 20px 50px rgba(0,0,0,0.8)", zIndex: 2 }}>
            <img src={mobileImg} alt="" style={{ width: "100%", objectFit: "cover" }} />
          </div>
        )}
        {!desktopImg && <div style={{ position: "absolute", inset: "60px 60px 100px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: R.dim, fontSize: 14 }}>Sube una captura de escritorio</div>}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: isStory ? "28px 48px" : "20px 52px", background: "linear-gradient(to top, rgba(5,5,8,0.95) 0%, transparent 100%)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: isStory ? 32 : 26, fontWeight: 900, color: R.text, letterSpacing: "-0.02em" }}>{name}</div>
            {industry && <div style={{ fontSize: 14, color: R.muted, marginTop: 2 }}>{industry}</div>}
          </div>
          <Brand size="sm" />
        </div>
      </div>
    );
  }

  // Carousel slides
  if (templateId === "mkt-carousel-1") {
    return (
      <div style={{ ...BASE }}>
        {desktopImg && (
          <div style={{ position: "absolute", inset: 0 }}>
            <img src={desktopImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.6) 100%)" }} />
          </div>
        )}
        {!desktopImg && <Glow color={R.accent} top={-60} left={-60} size={400} />}
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "72px 56px" : "56px 64px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Brand />
          <div>
            <div style={{ fontSize: 11, color: R.accent, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Caso de éxito</div>
            <div style={{ fontSize: isStory ? 64 : 52, fontWeight: 900, color: R.text, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 12 }}>{name}</div>
            {industry && <div style={{ fontSize: 18, color: R.muted }}>{industry}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, color: R.dim }}>1 / 6</div>
            <div style={{ fontSize: 13, color: R.dim }}>Desliza →</div>
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "mkt-carousel-2") {
    return (
      <div style={{ ...BASE }}>
        <Glow color={R.red} top={-60} right={-60} size={320} />
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "72px 56px" : "56px 64px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Brand size="sm" />
            <div style={{ fontSize: 12, color: R.dim }}>2 / 6</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#ff6677", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>El problema</div>
            <div style={{ fontSize: isStory ? 50 : 40, fontWeight: 900, color: R.text, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>{typeConfig.problem}</div>
            {features.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {features.slice(0, 3).map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: R.red, fontWeight: 900, fontSize: 13 }}>×</span>
                    <span style={{ fontSize: 14, color: R.muted }}>{f}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 24, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
            <div style={{ width: 24, height: 3, borderRadius: 2, background: R.red }} />
            {[...Array(4)].map((_, i) => <div key={i} style={{ width: 24, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)" }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "mkt-carousel-3") {
    const solutionParts = typeConfig.solution.split("+").map(s => s.trim()).slice(0, 3);
    return (
      <div style={{ ...BASE }}>
        <Glow color={R.accent} bottom={-60} left={-60} size={320} />
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "72px 56px" : "56px 64px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Brand size="sm" />
            <div style={{ fontSize: 12, color: R.dim }}>3 / 6</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: R.accent, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>La solución</div>
            <div style={{ fontSize: isStory ? 48 : 38, fontWeight: 900, color: R.text, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 24 }}>Así lo resolvimos</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {solutionParts.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 18px", background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(0,255,136,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: R.accent, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: R.text }}>{item}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[...Array(2)].map((_, i) => <div key={i} style={{ width: 24, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />)}
            <div style={{ width: 24, height: 3, borderRadius: 2, background: R.accent }} />
            {[...Array(3)].map((_, i) => <div key={i} style={{ width: 24, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)" }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "mkt-carousel-4") {
    const feats = features.length ? features.slice(0, 5) : typeConfig.solution.split("+").map(s => s.trim());
    return (
      <div style={{ ...BASE }}>
        <Glow color={R.blue} top={-60} right={-60} size={320} />
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "72px 56px" : "56px 64px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Brand size="sm" />
            <div style={{ fontSize: 12, color: R.dim }}>4 / 6</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: R.blue, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>Funcionalidades</div>
            <div style={{ fontSize: isStory ? 48 : 38, fontWeight: 900, color: R.text, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 24 }}>Lo que construimos</div>
            <div style={{ display: "grid", gridTemplateColumns: isLandscape ? "repeat(2,1fr)" : "1fr", gap: 10 }}>
              {feats.slice(0, 5).map((feat, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 16px", background: "rgba(74,158,255,0.05)", border: "1px solid rgba(74,158,255,0.14)", borderRadius: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: R.blue, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[...Array(3)].map((_, i) => <div key={i} style={{ width: 24, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />)}
            <div style={{ width: 24, height: 3, borderRadius: 2, background: R.blue }} />
            {[...Array(2)].map((_, i) => <div key={i} style={{ width: 24, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)" }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "mkt-carousel-5") {
    const positiveResults = ["Presencia digital profesional", "Más leads desde Google", "Procesos automatizados"];
    return (
      <div style={{ ...BASE }}>
        <Glow color={R.accent} top="50%" left="50%" size={400} />
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "72px 56px" : "56px 64px", height: "100%", display: "flex", flexDirection: isLandscape ? "row" : "column", justifyContent: "space-between", gap: isLandscape ? 40 : 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: isLandscape ? "flex-start" : "center", flexDirection: isLandscape ? "column" : "row", flexShrink: 0 }}>
            <Brand size="sm" />
            <div style={{ fontSize: 12, color: R.dim }}>5 / 6</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: R.accent, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>El resultado</div>
            <div style={{ fontSize: isStory ? 46 : 36, fontWeight: 900, color: R.text, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>Resultado real para {name}</div>
            {mobileImg ? (
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <img src={mobileImg} alt="" style={{ width: isLandscape ? 130 : 100, borderRadius: 12, flexShrink: 0, border: "2px solid rgba(0,255,136,0.2)" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {positiveResults.map(r => (
                    <div key={r} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: R.accent, fontSize: 14, fontWeight: 900, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {positiveResults.map(r => (
                  <div key={r} style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 16px", background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 10 }}>
                    <span style={{ color: R.accent, fontSize: 15, fontWeight: 900 }}>✓</span>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>{r}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "mkt-carousel-6") {
    return (
      <div style={{ ...BASE, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Glow color={R.accent} top="50%" left="50%" size={500} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: isStory ? "60px 56px" : "50px 64px", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 12, color: R.dim }}>6 / 6</div>
          <div>
            <div style={{ fontSize: isStory ? 52 : 44, fontWeight: 900, color: R.text, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 14 }}>¿Quieres esto para tu negocio?</div>
            <div style={{ fontSize: 17, color: R.muted, marginBottom: 32 }}>Desarrollamos presencia digital que genera resultados reales.</div>
            <CTABadge text={typeConfig.cta} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Brand />
            <div style={{ fontSize: 12, color: R.dim }}>ramosmkt.com</div>
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "story") {
    const img = mobileImg || desktopImg;
    return (
      <div style={{ ...BASE }}>
        {img && (
          <div style={{ position: "absolute", inset: 0 }}>
            <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,10,15,0.82) 0%, rgba(10,10,15,0.3) 40%, rgba(10,10,15,0.88) 80%)" }} />
          </div>
        )}
        {!img && <Glow color={R.accent} top="40%" left="50%" size={500} />}
        <div style={{ position: "relative", zIndex: 1, padding: "60px 48px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Brand />
          <div>
            <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 20, background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)", color: R.accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 18 }}>
              Proyecto completado
            </div>
            <div style={{ fontSize: 56, fontWeight: 900, color: R.text, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 12 }}>{typeConfig.hook}</div>
            {industry && <div style={{ fontSize: 18, color: R.muted, marginBottom: 16 }}>{industry}</div>}
            <div style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, maxWidth: 420, marginBottom: 28 }}>{shortDesc || typeConfig.solution}</div>
          </div>
          <div>
            <CTABadge text={typeConfig.cta} />
            <div style={{ marginTop: 12, fontSize: 12, color: R.dim }}>#RamosMKT #{industry.replace(/\s+/g, "")}</div>
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "reel-cover") {
    return (
      <div style={{ ...BASE }}>
        {desktopImg && (
          <div style={{ position: "absolute", inset: 0 }}>
            <img src={desktopImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,10,15,0.5) 0%, rgba(10,10,15,0.85) 70%)" }} />
          </div>
        )}
        {!desktopImg && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(10,10,15,1) 50%)" }} />}
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "60px 52px" : "44px 56px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Brand size="sm" />
          </div>
          <div>
            <div style={{ fontSize: isStory ? 80 : 60, fontWeight: 900, color: R.text, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 10 }}>Así quedó ▶</div>
            <div style={{ fontSize: 20, color: "rgba(255,255,255,0.6)", fontWeight: 600, marginBottom: 6 }}>{name}</div>
            {industry && <div style={{ fontSize: 15, color: R.dim }}>{typeConfig.label}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(0,255,136,0.15)", border: "2px solid rgba(0,255,136,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 18, marginLeft: 3 }}>▶</span>
            </div>
            <div style={{ fontSize: 14, color: R.muted }}>Ver reel completo</div>
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "meta-ad") {
    const positiveResults = ["Presencia digital profesional", "Más leads desde Google Maps", "Automatización de procesos"];
    return (
      <div style={{ ...BASE }}>
        {desktopImg && (
          <div style={{ position: "absolute", inset: 0 }}>
            <img src={desktopImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,15,0.65)" }} />
          </div>
        )}
        {!desktopImg && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,255,136,0.08) 0%, rgba(10,10,15,1) 60%)" }} />}
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "64px 52px" : "48px 60px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ padding: "6px 16px", borderRadius: 20, background: R.accent, color: "#000", fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>CASO DE ÉXITO</div>
            <Brand size="sm" />
          </div>
          <div>
            <div style={{ fontSize: isStory ? 50 : 40, fontWeight: 900, color: R.text, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 24, maxWidth: 560 }}>
              Así transformamos la presencia digital de <span style={{ color: R.accent }}>{name}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {positiveResults.map(r => (
                <div key={r} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(0,255,136,0.15)", border: "1px solid rgba(0,255,136,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: R.accent, fontSize: 12, fontWeight: 900 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: R.text, marginBottom: 4 }}>¿Quieres lo mismo para tu negocio?</div>
              <div style={{ fontSize: 13, color: R.muted }}>ramosmkt.com</div>
            </div>
            <div style={{ padding: "12px 28px", borderRadius: 9, background: R.accent, color: "#000", fontSize: 15, fontWeight: 900 }}>Contáctanos</div>
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "linkedin-creative") {
    return (
      <div style={{ ...BASE, background: "#111118" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 300, height: "100%", background: "rgba(0,255,136,0.03)", borderLeft: "1px solid rgba(0,255,136,0.06)" }} />
        <div style={{ position: "relative", zIndex: 1, padding: isStory ? "56px 52px" : "44px 56px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Brand size="lg" />
            <div style={{ fontSize: 11, color: R.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Agencia de Marketing Digital</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: R.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Proyecto completado</div>
            <div style={{ fontSize: isStory ? 42 : 34, fontWeight: 900, color: R.text, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
              {name}: {typeConfig.label}
            </div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 560, marginBottom: 24 }}>{longDesc || typeConfig.solution}</div>
            {features.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {features.slice(0, 4).map((f, i) => (
                  <div key={i} style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{f}</div>
                ))}
              </div>
            )}
          </div>
          <div style={{ fontSize: 13, color: R.muted }}>ramosmkt.com · #DesarrolloWeb #Marketing #Tecnología</div>
        </div>
      </div>
    );
  }

  if (templateId === "portfolio-card") {
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column" }}>
        {/* Top 60% image */}
        <div style={{ flex: "0 0 60%", position: "relative", overflow: "hidden" }}>
          {desktopImg
            ? <img src={desktopImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: R.dim, fontSize: 14 }}>Captura desktop</div>
          }
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, rgba(10,10,15,0.9) 100%)" }} />
        </div>
        {/* Bottom info */}
        <div style={{ flex: 1, padding: "20px 28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: isStory ? 28 : 22, fontWeight: 900, color: R.text, letterSpacing: "-0.02em", marginBottom: 6 }}>{name}</div>
            {industry && <div style={{ fontSize: 13, color: R.muted, marginBottom: 12 }}>{industry}</div>}
            {features.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {features.slice(0, 4).map((f, i) => (
                  <div key={i} style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", fontSize: 11, color: R.accent }}>{f}</div>
                ))}
              </div>
            )}
          </div>
          <Brand size="sm" />
        </div>
      </div>
    );
  }

  if (templateId === "case-study") {
    const feats = features.length ? features : typeConfig.solution.split("+").map(s => s.trim());
    return (
      <div style={{ ...BASE, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isStory ? "36px 48px 20px" : "22px 52px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Brand />
            <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ fontSize: 11, color: R.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Caso de Éxito</div>
          </div>
          {desktopImg && <img src={desktopImg} alt="" style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }} />}
        </div>
        <div style={{ flex: 1, padding: isStory ? "24px 48px" : "16px 52px", display: "flex", flexDirection: isLandscape ? "row" : "column", gap: isLandscape ? 36 : 20, overflow: "hidden" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: R.dim, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 6 }}>Cliente</div>
              <div style={{ fontSize: isStory ? 26 : 22, fontWeight: 900, color: R.text, letterSpacing: "-0.02em" }}>{name}</div>
              {industry && <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: R.muted, fontSize: 11, marginTop: 4 }}>{industry}</div>}
            </div>
            <div>
              <div style={{ fontSize: 10, color: R.dim, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 6 }}>El reto</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{typeConfig.problem}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: R.dim, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 6 }}>La solución</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{longDesc || typeConfig.solution}</div>
            </div>
          </div>
          <div style={{ flex: isLandscape ? "0 0 280px" : 1, display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 10, color: R.dim, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 10 }}>Funcionalidades</div>
              {feats.slice(0, isLandscape ? 5 : 4).map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
                  <span style={{ color: R.accent, fontSize: 11, marginTop: 3 }}>●</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 16px", background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.18)", borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: R.muted, marginBottom: 4 }}>¿Resultados similares para tu negocio?</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: R.accent }}>ramosmkt.com</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...BASE, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: R.dim, fontSize: 14 }}>Template en construcción</div>
    </div>
  );
}

// ProjectForm component
function ProjectForm({ project, onSave, onCancel }) {
  const [form, setForm] = useState(project || {
    id: Date.now().toString(),
    name: "",
    industry: "",
    projectUrl: "",
    description: "",
    features: "",
    desktopImg: null,
    mobileImg: null,
    createdAt: new Date().toISOString(),
  });
  const desktopRef = useRef(null);
  const mobileRef = useRef(null);

  function handleFileChange(field, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, [field]: ev.target.result }));
    reader.readAsDataURL(file);
  }

  const inputStyle = { background: theme.s2, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "8px 12px", color: theme.text, fontSize: 12, outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 11, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 4 }}>
        {project ? "Editar proyecto" : "Nuevo proyecto"}
      </div>
      <input type="text" placeholder="Nombre del proyecto *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
      <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} style={{ ...inputStyle, color: form.industry ? theme.text : theme.muted }}>
        <option value="">Industria...</option>
        {Object.entries(PROJECT_TYPES).map(([key, val]) => <option key={key} value={val.label}>{val.label}</option>)}
      </select>
      <input type="url" placeholder="URL del proyecto (opcional)" value={form.projectUrl || ""} onChange={e => setForm(f => ({ ...f, projectUrl: e.target.value }))} style={inputStyle} />
      <textarea placeholder="Descripción: ¿Qué desarrollaste? ¿Qué problema resolvía?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
      <textarea placeholder="Funcionalidades (una por línea): reservas, panel admin, galería..." value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} />

      {/* Desktop image */}
      <div>
        <div style={{ fontSize: 10, color: theme.muted, marginBottom: 4 }}>Captura desktop</div>
        <div onClick={() => desktopRef.current?.click()} style={{ border: `2px dashed ${form.desktopImg ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.12)"}`, borderRadius: 10, padding: "10px", cursor: "pointer", textAlign: "center", background: "rgba(255,255,255,0.02)" }}>
          {form.desktopImg ? <img src={form.desktopImg} style={{ width: "100%", height: 60, objectFit: "cover", borderRadius: 6 }} alt="" /> : <div style={{ fontSize: 11, color: theme.muted }}>+ Subir captura desktop</div>}
        </div>
        <input ref={desktopRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFileChange("desktopImg", e)} />
      </div>

      {/* Mobile image */}
      <div>
        <div style={{ fontSize: 10, color: theme.muted, marginBottom: 4 }}>Captura móvil</div>
        <div onClick={() => mobileRef.current?.click()} style={{ border: `2px dashed ${form.mobileImg ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.12)"}`, borderRadius: 10, padding: "10px", cursor: "pointer", textAlign: "center", background: "rgba(255,255,255,0.02)" }}>
          {form.mobileImg ? <img src={form.mobileImg} style={{ width: "100%", height: 60, objectFit: "cover", borderRadius: 6 }} alt="" /> : <div style={{ fontSize: 11, color: theme.muted }}>+ Subir captura móvil</div>}
        </div>
        <input ref={mobileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFileChange("mobileImg", e)} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <Button variant="primary" size="sm" onClick={() => { if (!form.name.trim()) return; onSave({ ...form, name: form.name.trim() }); }} style={{ flex: 1 }}>Guardar proyecto</Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}

export function ShowcaseTab({ format }) {
  const [projects, setProjects] = useState(loadProjects);
  const [activeProjectId, setActiveProjectId] = useState(projects[0]?.id || null);
  const [showForm, setShowForm] = useState(projects.length === 0);
  const [editingProject, setEditingProject] = useState(null);
  const [templateId, setTemplateId] = useState("service-promo");
  const [previewOpen, setPreviewOpen] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || { name: "Tu negocio", industry: "", description: "", features: "" };

  const { exportRef, downloading, message, download } = useAssetExport({
    filename: `rmkt-showcase-${templateId}-${(activeProject.name || "rmkt").toLowerCase().replace(/\s+/g, "-")}-${format?.id || "landscape"}`
  });

  const previewScale = Math.min(600 / (format?.w || 1200), 340 / (format?.h || 630));
  const previewW = (format?.w || 1200) * previewScale;
  const previewH = (format?.h || 630) * previewScale;
  const currentTemplate = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];

  function handleSave(project) {
    let updated;
    if (editingProject) {
      updated = projects.map(p => p.id === project.id ? project : p);
    } else {
      updated = [...projects, project];
    }
    saveProjects(updated);
    setProjects(updated);
    setActiveProjectId(project.id);
    setShowForm(false);
    setEditingProject(null);
  }

  function handleDelete(id) {
    const updated = projects.filter(p => p.id !== id);
    saveProjects(updated);
    setProjects(updated);
    if (activeProjectId === id) setActiveProjectId(updated[0]?.id || null);
  }

  function handleEdit(proj) {
    setEditingProject(proj);
    setShowForm(true);
  }

  function renderTemplate(id) {
    return <ShowcaseTemplate templateId={id} project={activeProject} format={format} />;
  }

  return (
    <div style={{ flex: 1, height: "100%", display: "grid", gridTemplateColumns: "280px 1fr", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ borderRight: `1px solid ${theme.border}`, overflowY: "auto", display: "flex", flexDirection: "column" }}>

        {/* Projects section */}
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Proyectos</div>
            <button onClick={() => { setShowForm(true); setEditingProject(null); }} style={{ width: 24, height: 24, borderRadius: 6, background: theme.accentBg, border: `1px solid ${theme.accentBorder}`, color: theme.accent, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>+</button>
          </div>

          {showForm ? (
            <ProjectForm
              project={editingProject}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingProject(null); }}
            />
          ) : (
            <>
              {projects.length === 0 && (
                <div style={{ fontSize: 12, color: theme.muted, padding: "10px 4px", lineHeight: 1.5 }}>Crea tu primer proyecto para generar Showcase Assets.</div>
              )}
              {projects.map(p => (
                <div
                  key={p.id}
                  onClick={() => setActiveProjectId(p.id)}
                  style={{ padding: "9px 11px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: activeProjectId === p.id ? theme.accentBg : "transparent", border: `1px solid ${activeProjectId === p.id ? theme.accentBorder : "transparent"}` }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: activeProjectId === p.id ? 700 : 500, color: activeProjectId === p.id ? theme.accent : theme.text, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: theme.muted }}>{p.industry || "Sin industria"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4, marginLeft: 6 }}>
                      <button onClick={e => { e.stopPropagation(); handleEdit(p); }} style={{ background: "transparent", border: "none", color: theme.muted, fontSize: 11, cursor: "pointer", padding: "2px 4px" }}>✎</button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(p.id); }} style={{ background: "transparent", border: "none", color: theme.muted, fontSize: 11, cursor: "pointer", padding: "2px 4px" }}>×</button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Templates section */}
        {!showForm && (
          <div style={{ padding: "14px 16px", flex: 1 }}>
            <div style={{ fontSize: 10, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>Plantillas</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {TEMPLATES.map(item => (
                <div
                  key={item.id}
                  onClick={() => setTemplateId(item.id)}
                  style={{ padding: "9px 11px", borderRadius: 8, cursor: "pointer", background: templateId === item.id ? theme.accentBg : "transparent", border: `1px solid ${templateId === item.id ? theme.accentBorder : "transparent"}` }}
                >
                  <div style={{ fontSize: 11, fontWeight: templateId === item.id ? 700 : 500, color: templateId === item.id ? theme.accent : theme.text, marginBottom: 1 }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: theme.muted, lineHeight: 1.3 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview + footer */}
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#060606", padding: 28 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: previewW, height: previewH, overflow: "hidden", borderRadius: 10, boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)" }}>
              <div style={{ width: format?.w, height: format?.h, transform: `scale(${previewScale})`, transformOrigin: "top left" }}>
                {renderTemplate(templateId)}
              </div>
            </div>
            <div style={{ position: "absolute", bottom: -28, left: 0, right: 0, textAlign: "center", fontSize: 10, color: theme.muted }}>
              Vista previa · exporta en {format?.w}×{format?.h} px
            </div>
          </div>
        </div>
        <div style={{ minHeight: 66, borderTop: `1px solid ${theme.border}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 12, background: theme.s1, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{currentTemplate?.label} · {format?.label}</div>
            <div style={{ fontSize: 11, color: theme.muted }}>{downloading ? "Generando imagen..." : `${format?.w}×${format?.h} px`}</div>
          </div>
          {message && <span style={{ fontSize: 12, color: theme.accent, fontWeight: 600 }}>{message}</span>}
          <Button variant="ghost" size="md" onClick={() => setPreviewOpen(true)}>Ver en grande</Button>
          <Button variant="secondary" size="md" onClick={() => download("png", format?.w, format?.h)} disabled={downloading}>Descargar PNG</Button>
          <Button variant="primary" size="md" onClick={() => download("jpg", format?.w, format?.h)} disabled={downloading}>Descargar JPG</Button>
        </div>
      </div>

      {/* Off-screen export canvas */}
      <div style={{ position: "fixed", left: -4000, top: 0, width: format?.w, height: format?.h, pointerEvents: "none" }}>
        <div ref={exportRef} style={{ width: format?.w, height: format?.h }}>
          {renderTemplate(templateId)}
        </div>
      </div>

      {/* Preview modal */}
      {previewOpen && (
        <div onClick={() => setPreviewOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ position: "relative" }}>
            {(() => {
              const ms = Math.min((window.innerWidth * 0.82) / (format?.w || 1200), (window.innerHeight * 0.80) / (format?.h || 630));
              return (
                <>
                  <div style={{ width: (format?.w || 1200) * ms, height: (format?.h || 630) * ms, overflow: "hidden", borderRadius: 12, boxShadow: "0 32px 80px rgba(0,0,0,0.9)" }}>
                    <div style={{ width: format?.w, height: format?.h, transform: `scale(${ms})`, transformOrigin: "top left" }}>
                      {renderTemplate(templateId)}
                    </div>
                  </div>
                  <button onClick={() => setPreviewOpen(false)} style={{ position: "absolute", top: -14, right: -14, width: 32, height: 32, borderRadius: "50%", background: theme.s3, border: `1px solid ${theme.border}`, color: theme.muted, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
