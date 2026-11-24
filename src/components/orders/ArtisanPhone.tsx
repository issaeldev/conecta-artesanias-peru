import { Fragment, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/artisanChat";

const time = (iso: string) =>
  new Intl.DateTimeFormat("es-PE", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

/** Convierte el *negrita* de WhatsApp en <b>. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/\*([^*\n]+)\*/g);
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <b key={i}>{part}</b> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}

export interface QuickReply {
  id: string;
  label: string;
}

interface Props {
  messages: ChatMessage[];
  replies: QuickReply[];
  onReply: (id: string) => void;
}

/**
 * Celular simulado del artesano con su chat de WhatsApp con Conecta Artesanías Perú.
 * Sirve para pedidos y para cotizaciones a medida. La interfaz del teléfono va siempre
 * en español: así lo vería el artesano. Cuando llega un mensaje nuevo de Conecta se
 * muestra "escribiendo…" un instante.
 */
export function ArtisanPhone({ messages, replies, onReply }: Props) {
  const [shown, setShown] = useState(messages.length);
  const bodyRef = useRef<HTMLDivElement>(null);
  const nextFrom = shown < messages.length ? messages[shown].from : null;
  const typing = nextFrom === "conecta";

  useEffect(() => {
    if (!nextFrom) return;
    const id = window.setTimeout(() => setShown((n) => n + 1), nextFrom === "artisan" ? 0 : 900);
    return () => window.clearTimeout(id);
  }, [shown, nextFrom]);

  // Si se reinicia o cambia la conversación y hay menos mensajes, no quedarse "adelantado".
  useEffect(() => {
    if (shown > messages.length) setShown(messages.length);
  }, [shown, messages.length]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [shown, typing]);

  return (
    <div className="phone">
      <div className="phone-notch" aria-hidden="true" />
      <div className="phone-screen">
        <div className="wa-head">
          <span className="wa-avatar" aria-hidden="true">
            ◆
          </span>
          <div>
            <p className="wa-name">Conecta Artesanías Perú</p>
            <p className="wa-sub">{typing ? "escribiendo…" : "Cuenta de empresa"}</p>
          </div>
        </div>

        <div className="wa-body" ref={bodyRef} aria-live="polite">
          <p className="wa-day">Hoy</p>
          {messages.slice(0, shown).map((m) => (
            <div key={m.id} className={`wa-msg ${m.from === "artisan" ? "out" : "in"}${m.image ? " has-photo" : ""}`}>
              {m.image && <img className="wa-photo" src={m.image} alt="" />}
              <RichText text={m.text} />
              <span className="wa-time">
                {time(m.at)}
                {m.from === "artisan" && <span className="wa-ticks"> ✓✓</span>}
              </span>
            </div>
          ))}
          {typing && (
            <div className="wa-msg in wa-typing" aria-label="escribiendo">
              <span />
              <span />
              <span />
            </div>
          )}
          {!typing && shown === messages.length && replies.length > 0 && (
            <div className="wa-replies">
              {replies.map((r) => (
                <button key={r.id} type="button" onClick={() => onReply(r.id)}>
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="wa-input" aria-hidden="true">
          <span>Mensaje</span>
        </div>
      </div>
    </div>
  );
}
