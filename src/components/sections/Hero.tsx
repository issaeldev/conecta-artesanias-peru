import { useI18n } from "@/i18n/I18nProvider";
import { useReveal } from "@/hooks/useReveal";
import "./Hero.css";

export function Hero() {
  const { t } = useI18n();
  const { ref, revealClass } = useReveal<HTMLHeadingElement>();

  return (
    <div className="hero">
      <div className="hv">
        <img src="/images/hero/artesana-telar.jpg" alt={t.hero.imageAlt} />
      </div>
      <div className="w">
        <p className="eyebrow">{t.hero.eyebrow}</p>
        <h1 ref={ref} className={revealClass || undefined}>
          {t.hero.title}
        </h1>
        <p>{t.hero.lead}</p>
        <div className="cta">
          <a className="btn" href="#catalogo">
            {t.hero.ctaPrimary}
          </a>
          <a className="btn o" href="#perfiles">
            {t.hero.ctaSecondary}
          </a>
        </div>
        <p className="how">{t.hero.how}</p>
      </div>
    </div>
  );
}
