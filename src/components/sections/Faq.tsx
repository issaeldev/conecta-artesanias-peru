import { useI18n } from "@/i18n/I18nProvider";
import { faqItems } from "@/data/faq";
import { SectionHeading } from "@/components/ui/SectionHeading";
import "./Faq.css";

export function Faq() {
  const { t, locale } = useI18n();
  return (
    <section id="faq">
      <div className="w">
        <SectionHeading title={t.faq.title} />
        {faqItems.map((item) => (
          <details key={item.id}>
            <summary>{item.question[locale]}</summary>
            <p>{item.answer[locale]}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
