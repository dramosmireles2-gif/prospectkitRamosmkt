import { useEffect, useRef, useState } from "react";
import { Button, Card, EmptyState } from "../components/Primitives";
import { theme } from "../app/theme";
import { useIsMobile } from "../hooks/useIsMobile";

const steps = [
  "Analizando presencia digital...",
  "Priorizando oportunidades comerciales...",
  "Generando mensajes personalizados...",
  "Armando propuesta before/after...",
  "Kit de prospección listo"
];

function SpinnerIcon() {
  const [deg, setDeg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setDeg((current) => current + 8), 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ transform: `rotate(${deg}deg)` }}>
      <circle cx="24" cy="24" r="19" stroke="rgba(0,255,136,0.15)" strokeWidth="4" />
      <path d="M24 5A19 19 0 0 1 43 24" stroke={theme.accent} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function KitScreen({ prospect, onGenerateKit, onRegenerateKit, onOpenAssets }) {
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState(prospect?.kit ? "done" : "idle");
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState("messages");
  const [copyStatus, setCopyStatus] = useState(null);
  const [error, setError] = useState("");
  const [editedMessages, setEditedMessages] = useState({});
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  function clearProgressTimers() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  useEffect(() => {
    clearProgressTimers();
    setPhase(prospect?.kit ? "done" : "idle");
    setStep(0);
    setTab("messages");
    setCopyStatus(null);
    setError("");
    setEditedMessages({});
    return () => clearProgressTimers();
  }, [prospect?.id, prospect?.kit?.id]);

  if (!prospect) {
    return <EmptyState title="Selecciona un prospecto" description="El kit depende de un prospecto persistido dentro del workspace." />;
  }

  const kit = prospect.kit?.channelMessages;
  const proposal = prospect.kit?.proposalSnapshot;

  const messages = kit
    ? [
        { id: "whatsapp", label: "WhatsApp", icon: "💬", color: "#25d366", text: kit.whatsapp },
        { id: "instagram", label: "Instagram DM", icon: "📷", color: "#e1306c", text: kit.instagram },
        { id: "facebook", label: "Facebook DM", icon: "👥", color: "#1877f2", text: kit.facebook },
        { id: "email", label: "Email", icon: "✉️", color: theme.blue, text: `ASUNTO: ${kit.email.subject}\n\n${kit.email.body}` }
      ]
    : [];

  function getCurrentText(id, originalText) {
    return editedMessages[id] !== undefined ? editedMessages[id] : originalText;
  }

  function handleEditMessage(id, value) {
    setEditedMessages((prev) => ({ ...prev, [id]: value }));
  }

  async function startGenerate() {
    clearProgressTimers();
    setError("");
    setPhase("loading");
    setStep(0);
    let current = 0;

    intervalRef.current = setInterval(() => {
      current += 1;
      setStep(current);

      if (current >= steps.length - 1) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        timeoutRef.current = setTimeout(async () => {
          try {
            await onGenerateKit();
            setPhase("done");
          } catch (nextError) {
            setError(nextError.message || "No se pudo generar el kit.");
            setPhase(prospect.kit ? "done" : "idle");
            setStep(0);
          }
        }, 500);
      }
    }, 700);
  }

  async function copyText(id, text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus({ id, tone: "success", message: "Copiado" });
      setTimeout(() => setCopyStatus(null), 1800);
    } catch {
      setCopyStatus({ id, tone: "error", message: "No se pudo copiar" });
      setTimeout(() => setCopyStatus(null), 2200);
    }
  }

  function getWhatsAppUrl(text) {
    const digits = (prospect.whatsapp || "").replace(/\D/g, "");
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div
        style={{
          minHeight: isMobile ? 84 : 58,
          borderBottom: `1px solid ${theme.border}`,
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          flexWrap: isMobile ? "wrap" : "nowrap",
          padding: isMobile ? "12px 16px" : "0 28px",
          gap: 16,
          background: theme.bg
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.dim, marginBottom: 2, letterSpacing: "0.04em" }}>{prospect.name}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>Kit generator</div>
        </div>
        {phase === "done" ? (
          <>
            <Button variant="ghost" size="sm" onClick={onRegenerateKit}>
              Regenerar
            </Button>
            <Button variant="secondary" size="sm" onClick={onOpenAssets}>
              Crear assets
            </Button>
          </>
        ) : null}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 16 : 28 }}>
        {phase === "idle" ? (
          <div style={{ maxWidth: 540, margin: "0 auto", paddingTop: isMobile ? 24 : 48, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: theme.accentBg, border: `1px solid ${theme.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
              ✦
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, letterSpacing: "-0.02em", marginBottom: 8 }}>Generar kit de prospección</div>
              <div style={{ fontSize: 14, color: theme.muted, lineHeight: 1.6 }}>
                Guardará mensajes por canal y una propuesta before/after basada en el análisis heurístico de <strong style={{ color: theme.text }}>{prospect.name}</strong>.
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 9, width: "100%", maxWidth: 400, textAlign: "left" }}>
              {["Mensaje de WhatsApp", "Instagram DM", "Facebook DM", "Email profesional", "Propuesta before/after", "Snapshot persistido"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: theme.s2, borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 12, color: theme.muted }}>
                  <span style={{ color: theme.accent, fontWeight: 700, flexShrink: 0 }}>✓</span> {item}
                </div>
              ))}
            </div>
            {error ? <div style={{ fontSize: 13, color: theme.red }}>{error}</div> : null}
            <Button variant="primary" size="lg" onClick={startGenerate}>
              Generar kit ahora
            </Button>
          </div>
        ) : null}

        {phase === "loading" ? (
          <div style={{ maxWidth: 460, margin: "60px auto 0", display: "flex", flexDirection: "column", gap: 22, alignItems: "center" }}>
            <SpinnerIcon />
            <div style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{steps[step]}</div>
                <div style={{ fontSize: 13, color: theme.accent, fontWeight: 700 }}>{Math.round((step / (steps.length - 1)) * 100)}%</div>
              </div>
              <div style={{ height: 4, background: theme.border, borderRadius: 2 }}>
                <div style={{ height: "100%", background: theme.accent, borderRadius: 2, width: `${(step / (steps.length - 1)) * 100}%`, transition: "width 0.65s ease" }} />
              </div>
            </div>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
              {steps.slice(0, step + 1).map((item, index) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
                  <span style={{ color: index < step ? theme.accent : theme.muted, fontSize: 13, fontWeight: 700, width: 16 }}>{index < step ? "✓" : "◌"}</span>
                  <span style={{ fontSize: 13, color: index < step ? theme.muted : theme.text }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {phase === "done" && prospect.kit ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ padding: "14px 20px", background: theme.accentBg, border: `1px solid ${theme.accentBorder}`, borderRadius: 10, display: "flex", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: theme.accent, fontSize: 18 }}>✓</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: theme.accent }}>Kit generado para {prospect.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(0,255,136,0.55)" }}>Mensajes persistidos por canal y snapshot listo para exportar.</div>
                </div>
              </div>
              <Button variant="accent" size="sm" onClick={onOpenAssets}>
                Crear assets
              </Button>
            </div>

            <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${theme.border}`, overflowX: "auto" }}>
              {[
                { id: "messages", label: "Mensajes de contacto" },
                { id: "proposal", label: "Propuesta before/after" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  style={{
                    padding: "10px 20px",
                    background: "transparent",
                    border: "none",
                    borderBottom: tab === item.id ? `2px solid ${theme.accent}` : "2px solid transparent",
                    color: tab === item.id ? theme.accent : theme.muted,
                    fontSize: 13,
                    fontWeight: tab === item.id ? 600 : 400,
                    cursor: "pointer"
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === "messages" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {messages.map((message) => {
                  const currentText = getCurrentText(message.id, message.text);
                  return (
                    <Card key={message.id} style={{ padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: 10, marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 16 }}>{message.icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{message.label}</span>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: message.color }} />
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {message.id === "whatsapp" && prospect.whatsapp ? (
                            <a
                              href={getWhatsAppUrl(currentText)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "6px 12px",
                                borderRadius: 9,
                                background: "rgba(37,211,102,0.1)",
                                border: "1px solid rgba(37,211,102,0.3)",
                                color: "#25d366",
                                fontSize: 12,
                                fontWeight: 600,
                                textDecoration: "none"
                              }}
                            >
                              💬 Abrir en WhatsApp
                            </a>
                          ) : null}
                          <Button variant="secondary" size="sm" onClick={() => copyText(message.id, currentText)}>
                            {copyStatus?.id === message.id ? copyStatus.message : "Copiar"}
                          </Button>
                        </div>
                      </div>
                      <textarea
                        value={currentText}
                        onChange={(e) => handleEditMessage(message.id, e.target.value)}
                        style={{
                          width: "100%",
                          background: theme.s3,
                          borderRadius: 8,
                          padding: "14px 16px",
                          fontSize: 13,
                          color: theme.text,
                          lineHeight: 1.75,
                          whiteSpace: "pre-wrap",
                          border: `1px solid ${theme.border}`,
                          resize: "vertical",
                          minHeight: 100,
                          fontFamily: "inherit",
                          outline: "none",
                          boxSizing: "border-box"
                        }}
                      ></textarea>
                    </Card>
                  );
                })}
              </div>
            ) : null}

            {tab === "proposal" ? (
              <Card style={{ padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 18 }}>Propuesta before / after — {prospect.name}</div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                  <div style={{ padding: 18, background: theme.redBg, borderRadius: 10, border: "1px solid rgba(255,68,85,0.2)" }}>
                    <div style={{ fontSize: 11, color: theme.red, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Situación actual</div>
                    {proposal.before.map((item) => (
                      <div key={item} style={{ display: "flex", gap: 8, marginBottom: 9, fontSize: 13, color: theme.muted }}>
                        <span style={{ color: theme.red, flexShrink: 0, fontWeight: 700 }}>×</span> {item}
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: 18, background: theme.accentBg, borderRadius: 10, border: `1px solid ${theme.accentBorder}` }}>
                    <div style={{ fontSize: 11, color: theme.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Con RamosMKT</div>
                    {proposal.after.map((item) => (
                      <div key={item} style={{ display: "flex", gap: 8, marginBottom: 9, fontSize: 13, color: theme.muted }}>
                        <span style={{ color: theme.accent, flexShrink: 0, fontWeight: 700 }}>✓</span> {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${theme.border}`, color: theme.muted, lineHeight: 1.7 }}>
                  {proposal.summary}
                </div>
              </Card>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
