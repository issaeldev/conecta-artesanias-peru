import { useEffect, useRef, useState, type FormEvent } from "react";
import { siteConfig } from "@/config/site";
import { findCountry } from "@/data/countries";
import { useI18n } from "@/i18n/I18nProvider";
import { assistantTopics, detectTopic, findOrderId, type AssistantTopic } from "@/lib/assistant";
import { parcelStatus } from "@/lib/orders";
import { fill, formatDay } from "@/lib/text";
import { navigate, paths } from "@/hooks/useRoute";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { useOrders } from "@/state/OrdersProvider";
import type { Order } from "@/types/order";
import { onAssistantOpen } from "./assistantBus";
import "./Assistant.css";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
  topics?: AssistantTopic[];
  orders?: string[];
  trackId?: string;
  whatsapp?: boolean;
}

/**
 * Asistente Conecta: resuelve en la web las consultas generales (envíos, pagos, garantía,
 * seguimiento) y solo deriva a WhatsApp lo que necesita a una persona.
 */
export function Assistant() {
  const { t, locale } = useI18n();
  const a = t.assistant;
  const { orders, getOrder } = useOrders();
  const wa = useWhatsApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const nextId = useRef(1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => onAssistantOpen(() => setOpen(true)), []);

  // Saludo inicial (y de nuevo si cambia el idioma antes de empezar a conversar).
  useEffect(() => {
    setMessages((prev) =>
      prev.length > 1 ? prev : [{ id: 0, from: "bot", text: a.greeting, topics: assistantTopics }],
    );
  }, [a.greeting]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const add = (...list: Omit<Message, "id">[]) =>
    setMessages((prev) => [...prev, ...list.map((m) => ({ ...m, id: nextId.current++ }))]);

  const orderSummary = (order: Order): Omit<Message, "id"> => {
    const country = findCountry(order.customer.country)?.name[locale] ?? "";
    const lines = order.parcels.map((p) => {
      const status = parcelStatus(p);
      const title = fill(t.order.now[status].title, {
        artisan: p.artisanFirstName,
        region: p.regionName,
        country,
      });
      return fill(a.answers.orderParcel, {
        artisan: p.artisanFirstName,
        status: title,
        date: formatDay(p.deliveryBy, locale),
      });
    });
    return { from: "bot", text: [fill(a.answers.orderFound, { id: order.id }), ...lines].join("\n"), trackId: order.id };
  };

  const answer = (topic: AssistantTopic): Omit<Message, "id">[] => {
    const l = siteConfig.logistics;
    switch (topic) {
      case "order":
        if (orders.length === 0) return [{ from: "bot", text: a.answers.orderAsk }];
        return [
          { from: "bot", text: a.answers.orderMine, orders: orders.slice(0, 3).map((o) => o.id) },
          { from: "bot", text: a.answers.orderAsk },
        ];
      case "shipping":
        return [
          {
            from: "bot",
            text: fill(a.answers.shipping, {
              courier: l.courier,
              lima: l.shippingLima,
              province: l.shippingProvince,
              days: `${l.dispatchDays + l.transitDaysLima}–${l.dispatchDays + l.transitDaysProvince}`,
              intlCourier: l.international.courier,
              intlFrom: Math.min(...Object.values(l.international.shipping)),
              intlDays: `${l.dispatchDays + l.international.transitDays - 2}–${l.dispatchDays + l.international.transitDays + 3}`,
            }),
          },
        ];
      case "human":
        return [{ from: "bot", text: a.answers.human, whatsapp: true }];
      case "custom":
        return [{ from: "bot", text: a.answers.custom, whatsapp: true }];
      default:
        return [{ from: "bot", text: a.answers[topic] }];
    }
  };

  const ask = (topic: AssistantTopic) => {
    add({ from: "user", text: a.topics[topic] }, ...answer(topic));
  };

  const showOrder = (id: string) => {
    const order = getOrder(id);
    add(
      { from: "user", text: id },
      order ? orderSummary(order) : { from: "bot", text: fill(a.answers.orderNotFound, { id }) },
    );
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    const id = findOrderId(text);
    if (id) {
      const order = getOrder(id);
      add({ from: "user", text }, order ? orderSummary(order) : { from: "bot", text: fill(a.answers.orderNotFound, { id }) });
      return;
    }
    const topic = detectTopic(text);
    add(
      { from: "user", text },
      ...(topic ? answer(topic) : [{ from: "bot" as const, text: a.answers.fallback, topics: assistantTopics }]),
    );
  };

  return (
    <>
      {!open && (
        <button type="button" className="asst-fab" onClick={() => setOpen(true)}>
          <ChatIcon /> {a.open}
        </button>
      )}
      {open && (
        <div className="asst" role="dialog" aria-label={a.title}>
          <div className="asst-head">
            <span className="asst-avatar" aria-hidden="true">
              ◆
            </span>
            <div>
              <p className="asst-title">{a.title}</p>
              <p className="asst-sub">{a.subtitle}</p>
            </div>
            <button type="button" className="asst-close" aria-label={a.close} onClick={() => setOpen(false)}>
              ×
            </button>
          </div>

          <div className="asst-body" ref={bodyRef} aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={`asst-msg ${m.from}`}>
                <p>{m.text}</p>
                {m.orders && (
                  <div className="asst-chips">
                    {m.orders.map((id) => (
                      <button key={id} type="button" onClick={() => showOrder(id)}>
                        {id}
                      </button>
                    ))}
                  </div>
                )}
                {m.trackId && (
                  <button
                    type="button"
                    className="asst-link"
                    onClick={() => {
                      setOpen(false);
                      navigate(paths.order(m.trackId!));
                    }}
                  >
                    {a.answers.orderLink} →
                  </button>
                )}
                {m.whatsapp && (
                  <a className="asst-link" href={wa(a.humanMessage)} target="_blank" rel="noopener">
                    {a.answers.humanButton} →
                  </a>
                )}
                {m.topics && (
                  <div className="asst-chips">
                    {m.topics.map((topic) => (
                      <button key={topic} type="button" onClick={() => ask(topic)}>
                        {a.topics[topic]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form className="asst-form" onSubmit={submit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={a.placeholder}
              aria-label={a.placeholder}
            />
            <button type="submit" aria-label={a.send}>
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        fill="currentColor"
      />
    </svg>
  );
}
