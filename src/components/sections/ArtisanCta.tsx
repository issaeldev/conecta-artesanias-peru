import { useI18n } from "@/i18n/I18nProvider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import "./ArtisanCta.css";

/** Banda de cierre invitando a artesanos a sumarse. */
export function ArtisanCta() {
  const { t } = useI18n();
  return (
    <section className="cta2">
      <div className="w">
        <SectionHeading title={t.cta.title} />
        <p>{t.cta.body}</p>
        <a className="btn" href="#artesanos">
          {t.cta.button}
        </a>
      </div>
    </section>
  );
}
