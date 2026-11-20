import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Los estilos globales van primero para que los de cada componente puedan sobrescribirlos.
import "./styles/tokens.css";
import "./styles/base.css";
import App from "./App";
import { AppProviders } from "./state/AppProviders";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <App />
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
);
