import { useI18n } from "@/i18n/I18nProvider";

/**
 * Sello "Garantía Conecta". Es la respuesta a "¿por qué no comprarle directo al artesano?":
 * la protección solo existe si se paga dentro de la plataforma.
 */
export function Guarantee() {
  const { t } = useI18n();
  const c = t.checkout;
  return (
    <div className="guarantee">
      <p className="guarantee-title">
        <ShieldIcon /> {c.guaranteeTitle}
      </p>
      <ul>
        {c.guarantee.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="guarantee-only">{c.guaranteeOnly}</p>
    </div>
  );
}

export function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z" fill="currentColor" />
      <path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
