import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  error: Error | null;
}

/**
 * Si algo falla al dibujar, muestra el error y una salida en vez de dejar la página
 * en blanco (clave durante una demostración en vivo). Textos fijos en español porque
 * puede fallar el propio proveedor de idioma.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error al dibujar la página:", error, info.componentStack);
  }

  private resetDemo = () => {
    try {
      localStorage.removeItem("cap-orders");
    } catch {
      /* ignorar */
    }
    window.location.hash = "#top";
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div style={{ maxWidth: 560, margin: "80px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ fontSize: 24 }}>Algo salió mal al mostrar esta página</h1>
        <p>Puedes recargarla o reiniciar la demostración (borra los pedidos de prueba de este navegador).</p>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 12,
            fontSize: 13,
          }}
        >
          {error.message}
        </pre>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="btn" onClick={() => window.location.reload()}>
            Recargar
          </button>
          <button type="button" className="btn o" onClick={this.resetDemo}>
            Reiniciar demostración
          </button>
        </div>
      </div>
    );
  }
}
