import { theme } from "../app/theme";
import { Button } from "./Primitives";

const steps = [
  {
    num: 1,
    title: "Crea tu primer prospecto",
    desc: "Agrega un negocio local con su industria, ciudad y redes sociales.",
    action: true
  },
  {
    num: 2,
    title: "Genera el análisis",
    desc: "Claude analiza su presencia digital y detecta oportunidades de venta."
  },
  {
    num: 3,
    title: "Prepara la propuesta",
    desc: "Arma una propuesta con precios reales y genera assets visuales."
  },
  {
    num: 4,
    title: "Cierra y da seguimiento",
    desc: "Mueve al prospecto por el pipeline hasta ganar el proyecto."
  }
];

export function Onboarding({ onCreateProspect }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        overflowY: "auto"
      }}
    >
      <div
        style={{
          background: theme.s2,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          padding: 32,
          maxWidth: 560,
          width: "100%"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: theme.accent, letterSpacing: "-0.02em", marginBottom: 8 }}>
            Bienvenido a ProspectKit
          </div>
          <div style={{ fontSize: 14, color: theme.muted }}>
            Tu CRM de ventas para RamosMKT
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {steps.map((step) => (
            <div
              key={step.num}
              style={{
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                padding: "14px 16px",
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${theme.border}`,
                borderRadius: 10
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: theme.accentBg,
                  border: `1px solid ${theme.accentBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 900,
                  color: theme.accent,
                  flexShrink: 0
                }}
              >
                {step.num}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 3 }}>{step.title}</div>
                <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.5 }}>{step.desc}</div>
                {step.action && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onCreateProspect}
                    style={{ marginTop: 10 }}
                  >
                    Crear prospecto
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: "12px 16px",
            background: "rgba(255,255,136,0.05)",
            border: "1px solid rgba(255,255,136,0.15)",
            borderRadius: 8,
            fontSize: 12,
            color: theme.muted,
            lineHeight: 1.6
          }}
        >
          💡 Puedes importar prospectos desde CSV o usar los datos del análisis para generar mensajes de WhatsApp.
        </div>
      </div>
    </div>
  );
}
