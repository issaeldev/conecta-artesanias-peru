import { useI18n } from "@/i18n/I18nProvider";
import { siteConfig } from "@/config/site";
import "./Header.css";

export function Header() {
  const { t, locale, toggleLocale } = useI18n();

  const links = [
    { href: "#catalogo", label: t.nav.catalog },
    { href: "#confianza", label: t.nav.trust },
    { href: "#artesanos", label: t.nav.artisans },
    { href: "#mapa", label: t.nav.map },
    { href: "#quiz", label: t.nav.quiz },
    { href: "#faq", label: t.nav.faq },
  ];

  return (
    <header className="site-header">
      <div className="nav">
        <a className="logo" href="#top">
          {siteConfig.name}
        </a>
        <nav>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          <button id="lang" type="button" onClick={toggleLocale} aria-label={t.meta.languageLabel}>
            {locale === "es" ? (
              <>
                <b>ES</b>
                <span>EN</span>
              </>
            ) : (
              <>
                <span>ES</span>
                <b>EN</b>
              </>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
