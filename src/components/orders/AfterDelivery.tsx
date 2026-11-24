import { useId, useState } from "react";
import { navigate, paths } from "@/hooks/useRoute";
import { useI18n } from "@/i18n/I18nProvider";
import { canThank } from "@/lib/orders";
import { buildPassport, encodePassport } from "@/lib/passport";
import { fill } from "@/lib/text";
import { translateForArtisan } from "@/lib/translate";
import { useOrders } from "@/state/OrdersProvider";
import type { Order, Parcel } from "@/types/order";

/** Reduce la foto a ~640 px en JPEG para guardarla en el navegador sin llenar el almacenamiento. */
function shrinkImage(file: File, max = 640): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * k);
      canvas.height = Math.round(img.height * k);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("imagen no válida"));
    };
    img.src = url;
  });
}

/** Lo que se abre al entregar: el pasaporte de la pieza y el mensaje de vuelta al artesano. */
export function AfterDelivery({ order, parcel }: { order: Order; parcel: Parcel }) {
  const passport = buildPassport(order, parcel);
  if (!passport) return null;
  return (
    <div className="after">
      <PassportCard code={encodePassport(passport)} image={parcel.lines[0].image} />
      <ThanksBox order={order} parcel={parcel} />
    </div>
  );
}

function PassportCard({ code, image }: { code: string; image: string }) {
  const { t } = useI18n();
  const p = t.order.passportCard;
  return (
    <div className="passport-card">
      <img src={image} alt="" />
      <div>
        <p className="passport-card-title">📜 {p.title}</p>
        <p className="passport-card-body">{p.body}</p>
        <button type="button" className="btn" onClick={() => navigate(paths.passport(code))}>
          {p.open}
        </button>
      </div>
    </div>
  );
}

function ThanksBox({ order, parcel }: { order: Order; parcel: Parcel }) {
  const { t } = useI18n();
  const g = t.order.gratitude;
  const { sendThanks } = useOrders();
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [publicOk, setPublicOk] = useState(true);
  const [sending, setSending] = useState(false);
  const id = useId();
  const artisan = parcel.artisanFirstName;
  const thanks = parcel.events.find((e) => e.type === "thanks");
  const replied = parcel.events.some((e) => e.type === "thanks_reply");

  if (thanks?.type === "thanks") {
    return (
      <div className="thanks-box sent">
        <p className="thanks-box-title">💌 {fill(g.sent, { artisan })}</p>
        <div className="thanks-bubble">
          {thanks.photo && <img src={thanks.photo} alt="" />}
          <p>{thanks.message}</p>
        </div>
        {thanks.translation && (
          <p className="thanks-translated">{fill(g.translated, { artisan, text: thanks.translation.text })}</p>
        )}
        {replied ? (
          <div className="thanks-reply">
            <small>{fill(g.replied, { artisan })}</small>
            <p>{g.replyText}</p>
          </div>
        ) : (
          <p className="thanks-wait">{fill(g.waiting, { artisan })}</p>
        )}
      </div>
    );
  }

  if (!canThank(parcel)) return null;

  return (
    <form
      className="thanks-box"
      onSubmit={async (e) => {
        e.preventDefault();
        if (sending) return;
        setSending(true);
        // El artesano lee en español: si el mensaje viene en otro idioma, se traduce antes de enviarlo.
        const translation = await translateForArtisan(message.trim());
        sendThanks(order.id, parcel.id, { message, photo, publicOk, translation });
      }}
    >
      <label className="thanks-box-title" htmlFor={`${id}-msg`}>
        💌 {fill(g.title, { artisan })}
      </label>
      <p className="thanks-box-body">{g.body}</p>
      <textarea
        id={`${id}-msg`}
        rows={3}
        maxLength={450}
        value={message}
        placeholder={fill(g.placeholder, { artisan })}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="thanks-photo">
        {photo ? (
          <>
            <img src={photo} alt="" />
            <button type="button" className="linkish" onClick={() => setPhoto(undefined)}>
              {g.photoRemove}
            </button>
          </>
        ) : (
          <>
            <label className="btn o thanks-file">
              {g.photo}
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) setPhoto(await shrinkImage(file).catch(() => undefined));
                }}
              />
            </label>
            <button type="button" className="linkish" onClick={() => setPhoto(parcel.lines[0].image)}>
              {g.photoSample}
            </button>
          </>
        )}
      </div>
      <label className="thanks-public">
        <input type="checkbox" checked={publicOk} onChange={(e) => setPublicOk(e.target.checked)} />
        {g.publicOk}
      </label>
      <button type="submit" className="btn" disabled={!message.trim() || sending}>
        {sending ? g.sending : fill(g.send, { artisan })}
      </button>
    </form>
  );
}
