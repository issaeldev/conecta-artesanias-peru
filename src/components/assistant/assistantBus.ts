/** Permite abrir el asistente desde cualquier botón de la página sin pasar props. */
const EVENT = "cap:assistant-open";

export function openAssistant() {
  window.dispatchEvent(new Event(EVENT));
}

export function onAssistantOpen(handler: () => void): () => void {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
