import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/I18nProvider";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import "./Footer.css";

export function Footer() {
  const { t } = useI18n();
  const wa = useWhatsApp();
  const waHref = wa(t.whatsapp.general);
  const f = t.footer;

  return (
    <footer className="site-footer">
      <div className="w fg">
        <div>
          <div className="flogo">{siteConfig.name}</div>
          <p>{f.tagline}</p>
          <div className="soc">
            {siteConfig.social.map((s) => (
              <span key={s} className="pill">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4>{f.explore}</h4>
          <a href="#catalogo">{f.catalog}</a>
          <a href="#mapa">{f.map}</a>
          <a href="#camino">{f.journey}</a>
          <a href="#quiz">{f.quiz}</a>
        </div>
        <div>
          <h4>{f.safe}</h4>
          <a href="#confianza">{f.payShip}</a>
          <a href="#faq">{f.faq}</a>
          <a href="#faq">{f.policies}</a>
          <a href={waHref} target="_blank" rel="noopener">
            {f.whatsapp}
          </a>
        </div>
        <div>
          <h4>{f.artisans}</h4>
          <a href="#artesanos">{f.plans}</a>
          <a href={waHref} target="_blank" rel="noopener">
            {f.join}
          </a>
        </div>
      </div>
      <div className="w fbot">
        <span>
          © {siteConfig.copyrightYear} {f.rights}
        </span>
        <span>{f.prototype}</span>
      </div>
    </footer>
  );
}
