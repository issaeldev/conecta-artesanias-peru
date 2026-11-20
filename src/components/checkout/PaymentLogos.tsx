/** Logos simplificados de los medios de pago aceptados (SVG en línea, sin dependencias). */

export function VisaLogo() {
  return (
    <svg viewBox="0 0 48 30" width="44" height="28" role="img" aria-label="Visa">
      <rect width="48" height="30" rx="4" fill="#1A1F71" />
      <text
        x="24"
        y="20.5"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="14"
        fontStyle="italic"
        fontWeight="900"
        letterSpacing="0.5"
      >
        VISA
      </text>
    </svg>
  );
}

export function MastercardLogo() {
  return (
    <svg viewBox="0 0 48 30" width="44" height="28" role="img" aria-label="Mastercard">
      <rect width="48" height="30" rx="4" fill="#222" />
      <circle cx="19" cy="15" r="9" fill="#EB001B" />
      <circle cx="29" cy="15" r="9" fill="#F79E1B" />
      <path d="M24 7.5a9 9 0 0 1 0 15 9 9 0 0 1 0-15z" fill="#FF5F00" />
    </svg>
  );
}

export function YapeLogo() {
  return (
    <svg viewBox="0 0 48 30" width="44" height="28" role="img" aria-label="Yape">
      <rect width="48" height="30" rx="7" fill="#742284" />
      <text
        x="24"
        y="19.5"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial Rounded MT Bold, Arial, Helvetica, sans-serif"
        fontSize="13"
        fontWeight="800"
      >
        yape
      </text>
      <circle cx="39.5" cy="8" r="2.2" fill="#00D1B2" />
    </svg>
  );
}
