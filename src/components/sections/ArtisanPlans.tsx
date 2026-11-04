import { useI18n } from "@/i18n/I18nProvider";
import { artisanPlans } from "@/data/plans";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import "./ArtisanPlans.css";

/** "Para artesanos": planes con S/0 de costo inicial y comisión por venta. */
export function ArtisanPlans() {
  const { t, locale } = useI18n();
  const wa = useWhatsApp();

  return (
    <section id="artesanos" className="band">
      <div className="w">
        <SectionHeading title={t.plans.title} sub={t.plans.sub} />
        <div className="grid plans">
          {artisanPlans.map((plan) => (
            <Card key={plan.id} className={plan.featured ? "feat" : undefined}>
              <h3>{plan.name[locale]}</h3>
              <div className="big">
                S/0 <small>+ {plan.commission}%</small>
              </div>
              <ul>
                {plan.features[locale].map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <p className="note">{t.plans.note}</p>
        <div className="cta">
          <a className="btn" href={wa(t.whatsapp.general)} target="_blank" rel="noopener">
            {t.plans.join}
          </a>
        </div>
      </div>
    </section>
  );
}
