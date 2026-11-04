import { Fragment } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import "./Marquee.css";

/** Cinta animada con técnicas y materiales (se duplica para un bucle continuo). */
export function Marquee() {
  const { t } = useI18n();
  const words = [...t.marquee, ...t.marquee];
  return (
    <div className="mq" aria-hidden="true">
      <div className="mt">
        {words.map((w, i) => (
          <Fragment key={i}>
            <span>{w}</span>
            <i>◆</i>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
