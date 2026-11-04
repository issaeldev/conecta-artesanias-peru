import { useI18n } from "@/i18n/I18nProvider";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import "./TrustSection.css";

/** "Compra con confianza": cuatro garantías numeradas. */
export function TrustSection() {
  const { t } = useI18n();
  return (
    <section id="confianza" className="band">
      <div className="w">
        <SectionHeading title={t.trust.title} sub={t.trust.sub} />
        <div className="grid">
          {t.trust.items.map((item, i) => (
            <Card key={item.title}>
              <span className="num">{i + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
