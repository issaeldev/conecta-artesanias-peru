import { useState, type ReactNode } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { buildArtisanChat, replyLabel, type ChatMessage } from "@/lib/artisanChat";
import {
  availableReplies,
  awaitingBuyerDecision,
  handoverOf,
  nextCourierStep,
  nextIncident,
  parcelStatus,
} from "@/lib/orders";
import { fill } from "@/lib/text";
import { whatsappUrl } from "@/lib/whatsapp";
import { navigate, paths } from "@/hooks/useRoute";
import { useOrders } from "@/state/OrdersProvider";
import type { ArtisanReply, Order } from "@/types/order";
import { ArtisanPhone } from "./ArtisanPhone";

/** Lado del artesano de un pedido: su WhatsApp simulado y el panel para adelantar el tiempo. */
export function ArtisanPanel({ order }: { order: Order }) {
  const { t } = useI18n();
  const d = t.demo;
  const { artisanReply, advance, incident } = useOrders();
  const [selected, setSelected] = useState(order.parcels[0].id);
  const parcel = order.parcels.find((p) => p.id === selected) ?? order.parcels[0];
  const step = nextCourierStep(parcel);
  const nextInc = nextIncident(parcel);
  const status = parcelStatus(parcel);
  const replies = availableReplies(parcel);
  const messages = buildArtisanChat(order, parcel);

  const waitText = awaitingBuyerDecision(parcel)
    ? d.waitingBuyer
    : (status === "delivered" || status === "cancelled") && replies.length === 0
      ? d.finished
      : d.waitingArtisan;

  return (
    <ArtisanSide
      tabs={
        order.parcels.length > 1 && (
          <div className="chips" role="tablist">
            {order.parcels.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={p.id === parcel.id}
                className={`chip${p.id === parcel.id ? " on" : ""}`}
                onClick={() => setSelected(p.id)}
              >
                {p.artisanFirstName}
              </button>
            ))}
          </div>
        )
      }
      artisan={parcel.artisanFirstName}
      phoneKey={parcel.id}
      messages={messages}
      replies={replies.map((r) => ({ id: r, label: replyLabel(r, parcel) }))}
      onReply={(id) => artisanReply(order.id, parcel.id, id as ArtisanReply)}
    >
      {step ? (
        <button type="button" className="btn demo-step" onClick={() => advance(order.id, parcel.id)}>
          {fill(d.courier[step === "picked_up" && handoverOf(parcel) === "agency" ? "picked_up_agency" : step], {
            courier: parcel.courier,
            artisan: parcel.artisanFirstName,
            intlCourier: parcel.intlCourier,
          })}{" "}
          →
        </button>
      ) : (
        <p className="demo-wait">{waitText}</p>
      )}
      {nextInc && (
        <div className="demo-incidents">
          <p className="demo-sub">{d.incidents}</p>
          <button type="button" className="demo-incident" onClick={() => incident(order.id, parcel.id)}>
            {d.incident[nextInc]}
          </button>
        </div>
      )}
    </ArtisanSide>
  );
}

interface SideProps {
  artisan: string;
  phoneKey: string;
  messages: ChatMessage[];
  replies: { id: string; label: string }[];
  onReply: (id: string) => void;
  tabs?: ReactNode;
  children: ReactNode;
}

/** Celular del artesano + panel de demostración (compartido por pedidos y solicitudes a medida). */
export function ArtisanSide({ artisan, phoneKey, messages, replies, onReply, tabs, children }: SideProps) {
  const { t } = useI18n();
  const d = t.demo;
  const { resetDemo } = useOrders();
  const lastConecta = messages.filter((m) => m.from === "conecta").at(-1);

  const reset = () => {
    if (!window.confirm(d.resetConfirm)) return;
    resetDemo();
    navigate(paths.home);
  };

  return (
    <div className="artisan-side">
      {tabs}
      <p className="phone-label">{fill(d.phoneOf, { artisan })}</p>
      <ArtisanPhone key={phoneKey} messages={messages} replies={replies} onReply={onReply} />
      <p className="phone-note">{d.phoneNote}</p>

      <div className="demo-box">
        <p className="demo-title">⚙ {d.title}</p>
        <p className="demo-body">{d.body}</p>
        {children}
        <div className="demo-links">
          {lastConecta && (
            <a href={whatsappUrl("", lastConecta.text)} target="_blank" rel="noopener">
              {d.openReal}
            </a>
          )}
          <button type="button" onClick={reset}>
            {d.reset}
          </button>
        </div>
      </div>
    </div>
  );
}
