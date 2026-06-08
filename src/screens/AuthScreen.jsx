import { useState } from "react";
import { Button, Card, Field } from "../components/Primitives";
import { theme } from "../app/theme";
import { validateAuthForm } from "../utils/validation";

export function AuthScreen({ onSignIn, onSignUp, busy, notice }) {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const isSignUp = mode === "signup";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const { valid, errors } = validateAuthForm(form, isSignUp);
    setFieldErrors(errors);
    if (!valid) return;

    try {
      if (isSignUp) {
        await onSignUp(form);
      } else {
        await onSignIn(form);
      }
    } catch (nextError) {
      const msg = nextError.message || "";
      if (msg.includes("Invalid login")) {
        setError("Email o password incorrectos.");
      } else if (msg.includes("already registered")) {
        setError("Este email ya tiene una cuenta. Inicia sesion.");
      } else {
        setError(msg || "No se pudo autenticar. Intenta de nuevo.");
      }
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setFieldErrors({});
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
            RamosGrowth CRM
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 8 }}>ProspectKit</div>
          <div style={{ fontSize: 14, color: theme.muted, lineHeight: 1.7 }}>
            Administra prospectos, genera analisis accionables y prepara el terreno para vender este flujo como SaaS.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <Button variant={mode === "signin" ? "primary" : "secondary"} size="sm" onClick={() => switchMode("signin")}>
            Iniciar sesion
          </Button>
          <Button variant={mode === "signup" ? "primary" : "secondary"} size="sm" onClick={() => switchMode("signup")}>
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
              autoComplete="name"
              error={fieldErrors.fullName}
            />
          ) : null}
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) => setForm((current) => ({ ...current, email: value }))}
            placeholder="tu@email.com"
            autoComplete="email"
            error={fieldErrors.email}
          />
          <Field
            label="Password"
            type="password"
            value={form.password}
            onChange={(value) => setForm((current) => ({ ...current, password: value }))}
            placeholder="Minimo 6 caracteres"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            error={fieldErrors.password}
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
