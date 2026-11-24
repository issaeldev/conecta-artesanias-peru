import type { ArtisanReply, Order, Parcel } from "@/types/order";
import type { CustomRequest, RequestReply } from "@/types/request";
import { findCountry } from "@/data/countries";
import { isLimaDestination, nextPhotoStage, parcelArtisanAmount } from "./orders";
import { formatPen } from "./pricing";
import { counterOptions, quoteOptions } from "./requests";
import { languageName } from "./translate";

/**
 * Conversación de WhatsApp entre Conecta Artesanías Perú y el artesano.
 * Siempre en español y con lenguaje simple: el artesano no necesita entrar a la página.
 * Se deriva por completo de los eventos del envío, así nunca se desincroniza.
 */
export interface ChatMessage {
  id: string;
  from: "conecta" | "artisan";
  text: string;
  at: string;
  /** Foto adjunta (las que manda el artesano de su avance). */
  image?: string;
}

/** Texto de cada botón de respuesta rápida (es también lo que aparece como mensaje del artesano). */
export const replyLabels: Record<ArtisanReply, string> = {
  confirm: "1. Sí, la tengo",
  no_stock: "2. No tengo stock",
  more_days: "3. Necesito más días",
  days_2: "2 días más",
  days_5: "5 días más",
  send_photo: "📷 Enviar foto",
  ready: "LISTO",
  handover_agency: "1. Lo llevo a la agencia",
  handover_pickup: "2. Que lo recojan",
  payout_received: "1. Sí, lo recibí",
  thanks_reply: "🙏 ¡Gracias a ti!",
  delay_sick: "1. Me enfermé, necesito 3 días más",
  delay_material: "2. Me faltó material, necesito 5 días más",
  delay_cannot: "3. Ya no puedo hacerlo",
};

/** En una pieza a medida ya acordada las opciones son otras ("lo empiezo", no "la tengo"). */
export function replyLabel(reply: ArtisanReply, parcel: Parcel): string {
  if (parcel.custom && reply === "confirm") return "1. Confirmo, la empiezo";
  if (parcel.custom && reply === "more_days") return "2. Necesito más días";
  if (reply === "send_photo") {
    return nextPhotoStage(parcel) === "progress" ? "📷 Enviar foto del avance" : "📷 Enviar foto de la pieza";
  }
  return replyLabels[reply];
}

const longDate = new Intl.DateTimeFormat("es-PE", { weekday: "long", day: "numeric", month: "long" });
const day = (iso: string) => longDate.format(new Date(iso));

function piecesList(parcel: Parcel): string {
  return parcel.lines
    .map((l) => `• ${l.quantity} × ${l.name.es}${l.custom ? `\n   ${l.custom.details}` : ""}`)
    .join("\n");
}

function unitCount(parcel: Parcel): number {
  return parcel.lines.reduce((n, l) => n + l.quantity, 0);
}

export function buildArtisanChat(order: Order, parcel: Parcel): ChatMessage[] {
  const name = parcel.artisanFirstName;
  const buyer = order.customer.name.trim().split(/\s+/)[0] || "el comprador";
  const country = findCountry(order.customer.country)?.name.es ?? order.customer.country;
  const city = order.customer.city || order.customer.department;
  const destination = parcel.international ? `${city} (${country})` : city;
  const drop = parcel.dropOff;
  const plural = unitCount(parcel) > 1;
  const amount = formatPen(parcelArtisanAmount(parcel));
  const messages: ChatMessage[] = [];
  const push = (from: ChatMessage["from"], text: string, at: string, image?: string) =>
    messages.push({ id: `${parcel.id}-${messages.length}`, from, text, at, ...(image ? { image } : {}) });

  for (const e of parcel.events) {
    switch (e.type) {
      case "created":
        push(
          "conecta",
          [
            `¡Hola, ${name}! 👋`,
            parcel.custom ? `${buyer} ya pagó su *pieza a medida* 🎉` : `Tienes un *pedido nuevo* 🎉`,
            "",
            `Pedido: *${parcel.id}*`,
            piecesList(parcel),
            `Para: ${buyer}, ${destination}`,
            ...(parcel.international
              ? ["🌎 Envío internacional: tú lo envías a nuestro centro en Lima y nosotros lo mandamos al extranjero."]
              : []),
            "",
            `Te corresponde: *${amount}*`,
            `Envíalo hasta el: *${day(e.dispatchBy ?? parcel.dispatchBy)}*`,
            "",
            ...(parcel.custom
              ? ["¿Confirmas que la empiezas?", "1. Confirmo, la empiezo", "2. Necesito más días"]
              : [
                  plural ? "¿Tienes las piezas listas para vender?" : "¿Tienes la pieza lista para vender?",
                  "Responde con un número:",
                  "1. Sí, la tengo",
                  "2. No tengo stock",
                  "3. Necesito más días",
                ]),
          ].join("\n"),
          e.at,
        );
        break;
      case "confirmed":
        push("artisan", replyLabel("confirm", parcel), e.at);
        push(
          "conecta",
          [
            `¡Gracias, ${name}! ✅ Pedido confirmado.`,
            `Ya le avisamos a ${buyer} que estás preparando su pieza.`,
            "",
            parcel.custom
              ? "📷 Mientras la haces, mándanos una foto del avance: a los compradores les encanta verlo."
              : "📷 Antes de empacarla, mándanos una foto de la pieza: así el comprador ve la que recibirá.",
            "Cuando esté empacada, responde *LISTO* y coordinamos el recojo.",
            "",
            "📦 Consejo: envuélvela en papel y bolsa para protegerla de golpes y humedad.",
          ].join("\n"),
          e.at,
        );
        break;
      case "asked_days":
        push("artisan", replyLabel("more_days", parcel), e.at);
        push("conecta", "Entendido. ¿Cuántos días más necesitas para enviarla?", e.at);
        break;
      case "extended":
        push("artisan", replyLabels[e.days === 2 ? "days_2" : "days_5"], e.at);
        push(
          "conecta",
          [
            `Listo ✅ Tu nueva fecha de envío es el *${day(e.dispatchBy ?? parcel.dispatchBy)}*.`,
            `Le avisamos a ${buyer} para que sepa cuándo llega.`,
            "",
            "Cuando esté empacada, responde *LISTO*.",
          ].join("\n"),
          e.at,
        );
        break;
      case "no_stock":
        push("artisan", replyLabels.no_stock, e.at);
        push(
          "conecta",
          [
            `Gracias por avisarnos, ${name}. Cancelamos este pedido y le devolveremos el dinero a ${buyer}.`,
            "",
            "Cuando una pieza se agote, escríbenos *AGOTADO* y la retiramos del catálogo para que no vuelva a pasar. 🙏",
          ].join("\n"),
          e.at,
        );
        break;
      case "packed":
        push("artisan", replyLabels.ready, e.at);
        push(
          "conecta",
          [
            `¡Excelente, ${name}! 📦 ¿Cómo prefieres entregar el paquete?`,
            "",
            `1. Lo llevo a la *${drop.name}* (${drop.address})`,
            "2. Que lo recojan en mi taller",
          ].join("\n"),
          e.at,
        );
        break;
      case "ready": {
        // Sin recojo en su zona, el LISTO lleva directo a las instrucciones de la agencia.
        const asked = parcel.events.some((x) => x.type === "packed");
        push(
          "artisan",
          asked ? replyLabels[e.handover === "agency" ? "handover_agency" : "handover_pickup"] : replyLabels.ready,
          e.at,
        );
        const code = ["", "Escribe este código en el paquete:", `*${parcel.trackingCode}*`];
        push(
          "conecta",
          (e.handover === "agency"
            ? [
                `¡Excelente, ${name}! 🚚`,
                `Lleva el paquete a la *${drop.name}* hasta el *${day(e.pickupOn)}*.`,
                `📍 ${drop.address}`,
                `🕘 ${drop.hours}`,
                ...code,
                "",
                "Cuando lo dejes, la agencia nos avisa. No pagas nada: el envío ya está cubierto.",
              ]
            : [
                `¡Perfecto, ${name}! 🚚`,
                `${parcel.courier} pasará a recoger el paquete a tu taller el *${day(e.pickupOn)}*, entre 9 a. m. y 1 p. m.`,
                ...code,
              ]
          ).join("\n"),
          e.at,
        );
        break;
      }
      case "picked_up":
        push(
          "conecta",
          `📦 ${parcel.courier} ya tiene tu paquete. Va en camino a ${
            parcel.international ? "nuestro centro en Lima" : isLimaDestination(order.customer.department) ? "Lima" : city
          }.`,
          e.at,
        );
        break;
      case "at_hub":
        push(
          "conecta",
          `✅ Tu pieza llegó a nuestro centro en Lima y pasó la revisión de calidad. Ahora la enviamos a ${country}. 🌎`,
          e.at,
        );
        break;
      case "intl_shipped":
        break;
      case "out_for_delivery":
        break;
      case "delivered":
        push(
          "conecta",
          [
            `🎉 ¡Tu pieza llegó! ${buyer} ya la recibió.`,
            "",
            `💰 Tu pago de *${amount}* se depositará el *${day(e.payoutOn)}*.`,
            "",
            `¡Gracias por tu trabajo, ${name}!`,
          ].join("\n"),
          e.at,
        );
        break;
      case "paid_out":
        push(
          "conecta",
          [
            `💰 ¡Listo, ${name}! Te depositamos *${amount}* en tu cuenta *${parcel.payoutAccount}*.`,
            `N.° de operación: *${e.operation}*`,
            "",
            "¿Ya lo ves en tu cuenta? Responde:",
            "1. Sí, lo recibí",
          ].join("\n"),
          e.at,
        );
        break;
      case "delay_detected":
        push(
          "conecta",
          [
            `Hola, ${name} 👋 El pedido *${parcel.id}* debía enviarse el *${day(e.dueBy)}* y todavía no nos avisaste que está listo.`,
            "",
            "¿Qué pasó? Elige una opción para reprogramarlo:",
            replyLabels.delay_sick,
            replyLabels.delay_material,
            replyLabels.delay_cannot,
          ].join("\n"),
          e.at,
        );
        break;
      case "delay_reason":
        push("artisan", replyLabels[e.reason === "sick" ? "delay_sick" : "delay_material"], e.at);
        push(
          "conecta",
          [
            e.reason === "sick" ? `Lo sentimos, ${name}. Esperamos que te mejores pronto. 🙏` : `Gracias por avisarnos, ${name}.`,
            `Le preguntaremos a ${buyer} si acepta la nueva fecha de envío: *${day(e.newDispatch)}*.`,
            "Te confirmamos en cuanto responda.",
          ].join("\n"),
          e.at,
        );
        break;
      case "delay_accepted":
        push(
          "conecta",
          [
            `✅ ${buyer} aceptó esperar. Tu nueva fecha de envío es el *${day(parcel.dispatchBy)}*.`,
            "Cuando esté empacada, responde *LISTO*.",
            "",
            "Si vas a necesitar más tiempo, avísanos *antes* de la fecha límite y lo coordinamos juntos. 🙏",
          ].join("\n"),
          e.at,
        );
        break;
      case "delay_cancelled":
        push(
          "conecta",
          [
            `${buyer} prefirió cancelar el pedido y le devolveremos su dinero.`,
            "",
            "Este retraso queda registrado en tu historial de cumplimiento. La próxima vez avísanos antes de la fecha límite y buscamos una solución juntos. 🙏",
          ].join("\n"),
          e.at,
        );
        break;
      case "delay_abandoned":
        push("artisan", replyLabels.delay_cannot, e.at);
        push(
          "conecta",
          [
            `Entendido, ${name}. Cancelamos el pedido y le devolveremos el dinero a ${buyer}.`,
            "",
            "Queda registrado en tu historial de cumplimiento. Si algo te impide cumplir, avísanos antes de la fecha límite. 🙏",
          ].join("\n"),
          e.at,
        );
        break;
      case "courier_delay":
        push(
          "conecta",
          `📦 Te avisamos: ${parcel.international ? parcel.intlCourier : parcel.courier} reportó un retraso con tu paquete. No tienes que hacer nada: nosotros lo gestionamos y tu pago no se ve afectado.`,
          e.at,
        );
        break;
      case "photo":
        push("artisan", e.stage === "progress" ? "Así va avanzando 🧶" : "Ya está terminada ✨", e.at, e.src);
        push(
          "conecta",
          [
            `¡Qué bonita, ${name}! 😍 Ya se la mostramos a ${buyer} en su seguimiento.`,
            ...(e.stage === "progress" && nextPhotoStage(parcel)
              ? ["", "Cuando la termines, mándanos otra foto antes de empacarla."]
              : ["", "Cuando esté empacada, responde *LISTO*."]),
          ].join("\n"),
          e.at,
        );
        break;
      case "thanks":
        push(
          "conecta",
          [
            `💌 ${name}, ${buyer} recibió su pieza y te dejó un mensaje:`,
            "",
            // El artesano lee en español: si el comprador escribió en otro idioma, va traducido y con el original.
            `“${e.translation?.text ?? e.message}”`,
            ...(e.translation
              ? ["", `🌎 Traducido del ${languageName(e.translation.from)}. Original: “${e.message}”`]
              : []),
            ...(e.photo ? ["", "📷 Y te mandó una foto de tu pieza en su casa."] : []),
          ].join("\n"),
          e.at,
          e.photo,
        );
        break;
      case "thanks_reply":
        push("artisan", replyLabels.thanks_reply, e.at);
        push("conecta", `Se lo hicimos llegar a ${buyer} 💛 Mensajes como este ayudan a que más personas conozcan tu trabajo.`, e.at);
        break;
      case "payout_confirmed":
        push("artisan", replyLabels.payout_received, e.at);
        push(
          "conecta",
          `¡Gracias por confirmarlo! 🙌 Le mostraremos a ${buyer} que tu pago llegó bien. Así más compradores confían en tu trabajo.`,
          e.at,
        );
        break;
    }
  }
  return messages;
}

/* ---------- Pedido personalizado: cotización por WhatsApp ---------- */

/** Texto de cada respuesta del artesano en la cotización. */
export function requestReplyLabel(reply: RequestReply, req: CustomRequest): string {
  if (reply === "can_do") return "1. Sí, puedo hacerla";
  if (reply === "cannot_do") return "2. No puedo";
  const counter = counterOptions(req);
  if (reply === "counter_accept") return `1. Acepto S/ ${counter?.accept.artisanPrice}`;
  if (reply === "counter_meet") return `2. Punto medio: S/ ${counter?.meet.artisanPrice}`;
  if (reply === "counter_keep") return `3. Mantengo S/ ${counter?.keep.artisanPrice}`;
  const o = quoteOptions(req)[Number(reply.slice(-1))];
  return `S/ ${o.artisanPrice} · ${o.days} días`;
}

export function buildRequestChat(req: CustomRequest): ChatMessage[] {
  const name = req.artisanFirstName;
  const buyer = req.customer.name.trim().split(/\s+/)[0] || "Un comprador";
  const place =
    req.customer.country === "PE"
      ? req.customer.department
      : (findCountry(req.customer.country)?.name.es ?? req.customer.country);
  const { size, colors, notes } = req.details;
  const messages: ChatMessage[] = [];
  const push = (from: ChatMessage["from"], text: string, at: string) =>
    messages.push({ id: `${req.id}-${messages.length}`, from, text, at });

  for (const e of req.events) {
    switch (e.type) {
      case "created":
        push(
          "conecta",
          [
            `¡Hola, ${name}! 👋 ${buyer}, desde ${place}, quiere una pieza *a medida*:`,
            "",
            `*${req.productName.es}* (precio de catálogo: S/ ${req.basePrice})`,
            ...(size ? [`• Tamaño: ${size}`] : []),
            ...(colors ? [`• Colores: ${colors}`] : []),
            ...(notes ? [`• Detalles: ${notes}`] : []),
            `• Cantidad: ${req.quantity}`,
            "",
            "¿Puedes hacerla?",
            "1. Sí, puedo hacerla",
            "2. No puedo",
          ].join("\n"),
          e.at,
        );
        break;
      case "can_do":
        push("artisan", requestReplyLabel("can_do", req), e.at);
        push(
          "conecta",
          [
            "¡Qué bien! ¿Cuánto cobrarías tú por cada pieza y en cuántos días la tendrías lista?",
            "Elige una opción (es lo que *tú recibes*):",
            ...quoteOptions(req).map((o, i) => `${i + 1}. S/ ${o.artisanPrice} · ${o.days} días`),
          ].join("\n"),
          e.at,
        );
        break;
      case "cannot_do":
        push("artisan", requestReplyLabel("cannot_do", req), e.at);
        push("conecta", `Entendido, gracias por responder rápido. Le avisaremos a ${buyer}. 🙏`, e.at);
        break;
      case "quoted":
        push("artisan", `S/ ${e.artisanPrice} · ${e.days} días`, e.at);
        push(
          "conecta",
          [
            `Listo ✅ Le enviamos la cotización a ${buyer}: *S/ ${e.buyerPrice}* por pieza.`,
            `Tú recibes *S/ ${e.artisanPrice}* por cada una. Te avisamos si acepta.`,
          ].join("\n"),
          e.at,
        );
        break;
      case "counter": {
        const options = counterOptions(req);
        push(
          "conecta",
          [
            `${buyer} te hace una contraoferta 🤝`,
            `Propone *S/ ${e.buyerPrice}* por pieza: tú recibirías *S/ ${e.artisanPrice}*.`,
            `Tu precio era S/ ${options?.keep.artisanPrice}.`,
            "",
            "¿Qué le respondes? Es la última ronda:",
            `1. Acepto S/ ${options?.accept.artisanPrice}`,
            `2. Punto medio: S/ ${options?.meet.artisanPrice}`,
            `3. Mantengo S/ ${options?.keep.artisanPrice}`,
          ].join("\n"),
          e.at,
        );
        break;
      }
      case "counter_reply":
        push("artisan", requestReplyLabel(`counter_${e.decision}`, req), e.at);
        push(
          "conecta",
          [
            `Listo ✅ Le enviamos tu respuesta a ${buyer}: *S/ ${e.buyerPrice}* por pieza.`,
            `Tú recibes *S/ ${e.artisanPrice}* por cada una. Te avisamos si acepta.`,
          ].join("\n"),
          e.at,
        );
        break;
      case "accepted":
        push(
          "conecta",
          `🎉 ¡${buyer} aceptó y ya pagó! Te enviamos el pedido *${e.orderId}* con todos los detalles.`,
          e.at,
        );
        break;
      case "declined":
        push("conecta", `${buyer} decidió no continuar por ahora. ¡Gracias por cotizar, ${name}!`, e.at);
        break;
    }
  }
  return messages;
}
