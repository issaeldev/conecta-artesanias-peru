# Conecta Artesanías Perú — PMV

Plataforma que conecta a artesanos peruanos con compradores de Perú y del extranjero. Prototipo
funcional en **React 19 + TypeScript + Vite**, publicado en Vercel:
**<https://conecta-artesanias-peru.vercel.app/>** (despliegue automático desde `main`).

El prototipo simula de punta a punta lo que en la realidad tomaría días: el comprador paga, el
artesano responde por WhatsApp sin entrar a la página, el courier mueve el paquete y el dinero
llega al artesano, todo visible para el comprador.

## Comandos

```bash
npm install
npm run dev        # servidor de desarrollo (http://localhost:5173), incluye /api/tipo-cambio
npm run build      # verificación de tipos + build de producción en dist/
npm run preview    # sirve el build
npm test           # pruebas unitarias (Vitest)
```

Copia `.env.example` a `.env`:

| Variable | Uso |
| --- | --- |
| `VITE_WHATSAPP_NUMBER` | WhatsApp Business (ej. `51987654321`). Vacío = wa.me sin destinatario. |
| `VITE_PEN_PER_USD` | Tipo de cambio de **respaldo**, solo si el BCRP no responde. |

## Qué se puede demostrar

| Flujo | Dónde | Qué muestra |
| --- | --- | --- |
| Página principal | `/` | Mapa de regiones, artesanos y sus talleres, camino de una pieza, buscador tipo quiz, catálogo, planes, FAQ. ES/EN y S/ ↔ US$. |
| Pedido de catálogo | Carrito → checkout → seguimiento | Datos de prueba de un clic (nacional o internacional), un envío por taller, panel de demo para adelantar el tiempo. |
| Pedido a medida | "Pide a medida" | El artesano cotiza por WhatsApp, el comprador puede contraofertar, al aceptar se paga y sigue como un pedido. |
| WhatsApp del artesano | Junto al seguimiento | Celular simulado: el artesano confirma, pide más días, **envía fotos de su avance**, avisa LISTO y confirma su pago. |
| Fotos del taller | Barra de seguimiento | Las fotos que manda el artesano aparecen en el tramo "Confirmado → Empacado"; al tocarlas se amplían. A medida: avance + pieza terminada. Catálogo: la pieza real antes de empacar. |
| Desglose del precio | Catálogo y ficha | Cada tarjeta muestra "85% para Rosa" con una barra; la ficha detalla artesano, Servicio Conecta e IGV antes de comprar (mismo cálculo del checkout). |
| Mensaje al artesano | Seguimiento, tras la entrega | El comprador deja un mensaje y una foto; le llega al WhatsApp del artesano, que responde. Si está en otro idioma, el artesano lo recibe traducido al español con el original debajo (`api/traducir.ts`, MyMemory). Si lo autoriza, aparece como testimonio en la portada. |
| Pasaporte de la pieza | Seguimiento → "Ver pasaporte" | Certificado con QR: quién la hizo, técnica, oficio, días de trabajo, fotos del taller y pago verificado. Todo viaja en el enlace, así el QR funciona en cualquier celular. Compartir e imprimir. |
| Impacto en vivo | Portada | Soles transferidos, pedidos, % para el artesano, comunidades y países. Sube al transferir un pago en la demo (`paid_out`). Base simulada en `data/impact.ts`. |
| Camino del pago | "Ver el camino de tu pago" | Transparencia: cobro → retenido por la Garantía Conecta → transferido al artesano → el artesano confirma que lo recibió (captura del chat). |
| Incidencias | Panel de demo | Retraso del artesano (el comprador acepta la nueva fecha o cancela con reembolso) y retraso del courier. |
| Correos | Bandeja simulada | Los correos que recibiría el comprador en cada evento. |
| Asistente | Botón flotante | Respuestas guiadas por palabras clave (sin IA) y búsqueda por número de pedido `CAP-12345`. |

"Reiniciar demostración" borra los pedidos de prueba guardados en el navegador.

## Tipo de cambio (BCRP)

- `api/tipo-cambio.ts` es una función de Vercel que consulta la API del **BCRP**, serie
  `PD04640PD` (TC sistema bancario SBS, venta), y devuelve el último día hábil con dato:
  `{ "penPerUsd": 3.455, "date": "2026-11-23", "source": "BCRP" }`.
- La CDN de Vercel guarda la respuesta 12 h (`s-maxage`), así que se renueva sola cada día sin cron.
- Se llama desde el servidor porque el BCRP no permite llamadas desde el navegador (CORS). La API
  a veces agrega avisos HTML después del JSON; `src/lib/bcrp.ts` los descarta.
- `CurrencyProvider` lo pide al cargar, lo guarda en `localStorage` por el día y lo expone como
  `useCurrency().rate`. Si falla, usa `VITE_PEN_PER_USD`. El catálogo muestra la fecha del dato.
- En desarrollo, `vite.config.ts` ejecuta cualquier `api/<nombre>.ts` en `/api/<nombre>` con un middleware.

## Traducción de mensajes al artesano

`api/traducir.ts` usa la API pública de MyMemory (gratis, sin clave, detecta el idioma). Si el
texto ya está en español devuelve `null`; si falla, el mensaje se envía en el original. Para
producción conviene cambiar el proveedor (p. ej. la API de Claude) solo en ese archivo.

## Estructura

```
api/
  tipo-cambio.ts        Función de Vercel: tipo de cambio del día (BCRP)
public/images/          Fotos (hero, productos, pasos del camino, artesanos)
src/
  main.tsx              Punto de entrada (estilos globales + providers)
  App.tsx               Secciones de la página y rutas (inicio, checkout, pedido, a medida)
  config/site.ts        Configuración: WhatsApp, tipo de cambio de respaldo, comisión, IGV, logística
  types/                Modelos: domain (catálogo), order (pedidos y eventos), request (a medida)
  data/                 Datos de ejemplo (productos, regiones, talleres, países, FAQ, planes, quiz)
  services/catalogApi.ts  Acceso a datos: hoy datos locales, mañana una API real
  state/                Contextos: catálogo, carrito, moneda (con tipo de cambio), pedidos, ficha
  i18n/                 Textos ES/EN tipados (en.ts debe tener la misma forma que es.ts)
  lib/                  Lógica pura y testeada:
    orders.ts           Pedidos como lista de eventos: estado, respuestas del artesano, courier, fotos
    requests.ts         Solicitudes a medida: cotización, contraoferta, aceptación
    artisanChat.ts      Chat de WhatsApp derivado de los eventos (nunca se desincroniza)
    pricing.ts          Precio = artesano + comisión + IGV, y su reparto
    bcrp.ts             Lectura del tipo de cambio del BCRP
    assistant.ts        Asistente por palabras clave
    passport.ts         Pasaporte de la pieza: datos y enlace codificado (base64url)
    impact.ts           Contador de impacto y testimonios
  components/
    ui/                 Card, Chip, Modal, ErrorBoundary, QuantityStepper, ...
    layout/             Header, Footer, Marquee, ScrollProgress, FloatingActions
    sections/           Hero, RegionMap, ArtisanProfiles, PieceJourney, PieceFinder,
                        TrustSection, Catalog, ArtisanPlans, Faq, ArtisanCta
    product/            ProductCard, ProductImage, ProductDetailModal
    cart/               CartModal
    checkout/           CheckoutPage, PaymentSummary (desglose), Guarantee, PaymentLogos
    orders/             OrderPage, ParcelTracking (pasos, fotos, camino del pago),
                        ArtisanPanel + ArtisanPhone (demo), EmailModal
    custom/             CustomRequestPage (formulario), RequestPage (cotización)
    assistant/          Assistant
    passport/           PassportPage (#/pasaporte/<código>), QrCode
    sections/ImpactSection  Impacto en vivo + testimonios
    product/PriceSplit  Desglose del precio en tarjeta y ficha
    orders/AfterDelivery    Pasaporte y mensaje al artesano tras la entrega
```

Cada componente importa su propio `.css`. Los colores se definen una sola vez en
`src/styles/tokens.css`.

### Cómo funciona un pedido

Cada envío (uno por taller) guarda una **lista de eventos** (`created`, `confirmed`, `photo`,
`ready`, `picked_up`, `delivered`, `paid_out`, …). El estado, el texto del "ahora", el historial,
los correos y el chat del artesano se **derivan** de esa lista. Para añadir un paso nuevo basta
con un tipo de evento en `types/order.ts`, su efecto en `lib/orders.ts` y sus textos en `i18n/`.
Los eventos informativos (`photo`, `courier_delay`, `thanks`, `thanks_reply`) no cambian el estado.

## Datos de prototipo

- Productos, talleres e historias son de ejemplo (`src/data/`).
- Las fotos de artesanos son de stock: ver `public/images/artisans/README.md`. Las fotos de
  avance del taller reutilizan esas imágenes y las de producto.
- Pagos, courier, correos y WhatsApp están simulados. Comisión e IGV son supuestos
  (`config/site.ts`) a confirmar con contabilidad.

## Cómo crecer

- **Agregar una pieza:** añadirla en `src/data/products.ts` (y su id en la región / taller).
- **Backend real:** reemplazar `fetchCatalog()` en `src/services/catalogApi.ts` y guardar los
  pedidos en servidor en lugar de `localStorage` (`OrdersProvider`).
- **WhatsApp real:** los mensajes de `artisanChat.ts` se convierten en plantillas de WhatsApp
  Business API, y las respuestas del artesano (y sus fotos) llegan por webhook como eventos.
- **Pagos reales:** el checkout ya calcula el reparto; falta conectar una pasarela (Culqi,
  Mercado Pago, Stripe).
- **Nuevo idioma:** crear `src/i18n/xx.ts` con el tipo `Dictionary` y registrarlo en `I18nProvider`.
