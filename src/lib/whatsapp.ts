export interface OrderLine {
  name: string;
  quantity: number;
  /** Total de la línea en soles. */
  total: number;
}

export interface OrderMessageLabels {
  greeting: string;
  subtotal: string;
  name: string;
  destination: string;
}

/** Enlace wa.me con mensaje prellenado. */
export function whatsappUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/** Arma el texto del pedido que se envía por WhatsApp. */
export function buildOrderMessage(
  labels: OrderMessageLabels,
  lines: OrderLine[],
  customer: { name: string; destination: string },
): string {
  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
  return [
    labels.greeting,
    ...lines.map((l) => `- ${l.quantity} × ${l.name} (S/ ${l.total})`),
    `${labels.subtotal}: S/ ${subtotal}`,
    `${labels.name}: ${customer.name}`,
    `${labels.destination}: ${customer.destination}`,
  ].join("\n");
}
