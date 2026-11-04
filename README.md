# Conecta Artesanías Perú — PMV

Plataforma que conecta a artesanos peruanos con compradores. Migración del prototipo HTML
(`Conecta Artesanías Perú (2).html`) a **React 19 + TypeScript + Vite**, conservando su diseño,
colores, tipografías y comportamiento.

## Comandos

```bash
npm install
npm run dev        # servidor de desarrollo (http://localhost:5173)
npm run build      # verificación de tipos + build de producción en dist/
npm run preview    # sirve el build
npm test           # pruebas unitarias (Vitest)
```

Copia `.env.example` a `.env` y completa `VITE_WHATSAPP_NUMBER` con el número de WhatsApp Business.

## Estructura

```
public/images/          Fotos (hero, productos, pasos del camino)
src/
  main.tsx              Punto de entrada (estilos globales + providers)
  App.tsx               Orden de las secciones de la página
  config/site.ts        Configuración (WhatsApp, tipo de cambio, redes)
  types/domain.ts       Modelos: Product, Region, Workshop, JourneyStep, ...
  data/                 Datos de ejemplo (productos, regiones, talleres, FAQ, planes, quiz)
  services/catalogApi.ts  Acceso a datos: hoy datos locales, mañana una API real
  state/                Contextos: catálogo, carrito (persistido), moneda, ficha de producto
  i18n/                 Textos ES/EN tipados (en.ts debe tener la misma forma que es.ts)
  lib/                  Lógica pura y testeada: precios, recomendador, filtros, WhatsApp
  hooks/                useReveal, useScrollProgress, useWhatsApp
  styles/               tokens.css (paleta y fuentes) + base.css (componentes compartidos)
  components/
    ui/                 Card, Chip, Modal, QuantityStepper, SectionHeading, TextileDivider
    layout/             Header, Footer, Marquee, ScrollProgress, FloatingActions
    sections/           Hero, RegionMap, ArtisanProfiles, PieceJourney, PieceFinder,
                        TrustSection, Catalog, ArtisanPlans, Faq, ArtisanCta
    product/            ProductCard, ProductImage, ProductDetailModal
    cart/               CartModal
```

Cada componente importa su propio `.css`. Los colores se definen una sola vez en
`src/styles/tokens.css`.

## Cómo crecer

- **Agregar una pieza:** añadirla en `src/data/products.ts` (y su id en la región / taller).
- **Backend real:** reemplazar el cuerpo de `fetchCatalog()` en `src/services/catalogApi.ts`.
- **Nuevo idioma:** crear `src/i18n/xx.ts` con el tipo `Dictionary` y registrarlo en `I18nProvider`.
- **Pagos en línea:** hoy el pedido se envía por WhatsApp (`CartModal`); ahí iría el checkout.
