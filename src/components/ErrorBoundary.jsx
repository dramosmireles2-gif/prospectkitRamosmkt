import { Component } from "react";
import { Button } from "./Primitives";
import { theme } from "../app/theme";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: theme.bg,
            padding: 24
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>!</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, marginBottom: 8 }}>Algo salió mal</div>
            <div style={{ fontSize: 14, color: theme.muted, lineHeight: 1.7, marginBottom: 8 }}>
              {this.state.error?.message || "Error inesperado en la aplicación."}
            </div>
            <div
              style={{
                fontSize: 12,
                color: theme.dim,
                background: theme.s2,
                border: `1px solid ${theme.border}`,
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 20,
                textAlign: "left",
                maxHeight: 120,
                overflow: "auto",
                fontFamily: "monospace"
              }}
            >
              {this.state.error?.stack?.split("\n").slice(0, 4).join("\n") || "Sin stack trace disponible"}
            </div>
            <Button
              variant="primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Recargar aplicación
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
