import { Button, Card } from "../components/Primitives";
import { theme } from "../app/theme";

export function SetupScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        padding: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Card style={{ width: "min(760px, 100%)", padding: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 8 }}>ProspectKit v1</div>
            <div style={{ fontSize: 15, color: theme.muted, lineHeight: 1.7 }}>
              La app ya esta migrada a Vite y espera una conexion real con Supabase para operar con auth, workspaces y persistencia.
            </div>
          </div>

          <div
            style={{
              padding: 18,
              borderRadius: 12,
              border: `1px solid ${theme.accentBorder}`,
              background: theme.accentBg
            }}
          >
            <div style={{ fontSize: 13, color: theme.accent, fontWeight: 700, marginBottom: 10 }}>Configura estos pasos</div>
            <ol style={{ margin: 0, paddingLeft: 18, color: theme.muted, lineHeight: 1.8, fontSize: 14 }}>
              <li>Duplica <code>.env.example</code> como <code>.env</code>.</li>
              <li>Agrega <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>.</li>
              <li>Ejecuta el SQL de <code>supabase/migrations/001_initial_schema.sql</code> en tu proyecto Supabase.</li>
              <li>Arranca con <code>npm install</code> y <code>npm run dev</code>.</li>
            </ol>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Card style={{ padding: 18 }}>
              <div style={{ fontSize: 12, color: theme.dim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Incluye
              </div>
              <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.8 }}>
                Auth real, workspaces, prospects persistidos, analisis heuristico, kit guardado y exportacion local de assets.
              </div>
            </Card>
            <Card style={{ padding: 18 }}>
              <div style={{ fontSize: 12, color: theme.dim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Preparado para SaaS
              </div>
              <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.8 }}>
                Planes, estado de suscripcion, RLS, multi-tenant por workspace y gates de features listos para futuras suscripciones.
              </div>
            </Card>
          </div>

          <Button variant="secondary" onClick={() => window.location.reload()} style={{ alignSelf: "flex-start" }}>
            Reintentar despues de configurar
          </Button>
        </div>
      </Card>
    </div>
  );
}
