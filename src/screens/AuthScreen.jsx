import { useState } from "react";
import { Button, Card, Field } from "../components/Primitives";
import { theme } from "../app/theme";

export function AuthScreen({ onSignIn, onSignUp, busy, notice }) {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const isSignUp = mode === "signup";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (isSignUp) {
        await onSignUp(form);
      } else {
        await onSignIn(form);
      }
    } catch (nextError) {
      setError(nextError.message || "No se pudo autenticar.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(0,255,136,0.08), transparent 32%), radial-gradient(circle at bottom left, rgba(74,158,255,0.08), transparent 26%), #0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }}
    >
      <Card style={{ width: "min(470px, 100%)", padding: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: theme.accent, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            RamosMKT CRM
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 8 }}>ProspectKit</div>
          <div style={{ fontSize: 14, color: theme.muted, lineHeight: 1.7 }}>
            Administra prospectos, genera análisis accionables y prepara el terreno para vender este flujo como SaaS.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <Button variant={mode === "signin" ? "primary" : "secondary"} size="sm" onClick={() => setMode("signin")}>
            Iniciar sesión
          </Button>
          <Button variant={mode === "signup" ? "primary" : "secondary"} size="sm" onClick={() => setMode("signup")}>
            Crear cuenta
          </Button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {isSignUp ? (
            <Field
              label="Nombre completo"
              value={form.fullName}
              onChange={(value) => setForm((current) => ({ ...current, fullName: value }))}
              placeholder="Carlos Ramos"
            />
          ) : null}
          <Field
            label="Email"
            value={form.email}
            onChange={(value) => setForm((current) => ({ ...current, email: value }))}
            placeholder="tu@email.com"
          />
          <Field
            label="Password"
            value={form.password}
            onChange={(value) => setForm((current) => ({ ...current, password: value }))}
            placeholder="Mínimo 6 caracteres"
          />

          {error ? <div style={{ fontSize: 13, color: theme.red }}>{error}</div> : null}
          {notice ? <div style={{ fontSize: 13, color: theme.accent }}>{notice}</div> : null}

          <Button type="submit" variant="primary" size="lg" disabled={busy}>
            {busy ? "Procesando..." : isSignUp ? "Crear cuenta y workspace" : "Entrar a ProspectKit"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
