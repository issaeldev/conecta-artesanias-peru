import { useEffect } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { useRoute } from "@/hooks/useRoute";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Marquee } from "@/components/layout/Marquee";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { TextileDivider } from "@/components/ui/TextileDivider";
import { Hero } from "@/components/sections/Hero";
import { RegionMap } from "@/components/sections/RegionMap";
import { ArtisanProfiles } from "@/components/sections/ArtisanProfiles";
import { PieceJourney } from "@/components/sections/PieceJourney";
import { PieceFinder } from "@/components/sections/PieceFinder";
import { TrustSection } from "@/components/sections/TrustSection";
import { Catalog } from "@/components/sections/Catalog";
import { ArtisanPlans } from "@/components/sections/ArtisanPlans";
import { Faq } from "@/components/sections/Faq";
import { ArtisanCta } from "@/components/sections/ArtisanCta";
import { ProductDetailModal } from "@/components/product/ProductDetailModal";
import { CartModal } from "@/components/cart/CartModal";
import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { OrderPage } from "@/components/orders/OrderPage";
import { Assistant } from "@/components/assistant/Assistant";
import { CustomRequestPage } from "@/components/custom/CustomRequestPage";
import { RequestPage } from "@/components/custom/RequestPage";

function Landing() {
  return (
    <>
      <Hero />
      <Marquee />
      <TextileDivider />
      <RegionMap />
      <ArtisanProfiles />
      <PieceJourney />
      <PieceFinder />
      <TextileDivider />
      <TrustSection />
      <Catalog />
      <ArtisanPlans />
      <TextileDivider />
      <Faq />
    </>
  );
}

export default function App() {
  const { t } = useI18n();
  const route = useRoute();
  const isHome = route.name === "home";

  // Al cambiar de página: arriba del todo, o al ancla pedida (#catalogo…) al volver al inicio.
  useEffect(() => {
    const anchor = isHome ? window.location.hash.slice(1) : "";
    requestAnimationFrame(() => {
      const target = anchor && anchor !== "top" ? document.getElementById(anchor) : null;
      if (target) target.scrollIntoView();
      else window.scrollTo(0, 0);
    });
  }, [route.name, isHome]);

  return (
    <>
      {isHome && <ScrollProgress />}
      <a
        className="skip"
        href="#top"
        onClick={(e) => {
          // Sin cambiar el hash, que en checkout/pedido llevaría de vuelta al inicio.
          e.preventDefault();
          document.getElementById("top")?.focus();
        }}
      >
        {t.meta.skip}
      </a>
      <Header />

      <main id="top" tabIndex={-1}>
        {route.name === "checkout" && <CheckoutPage key={route.requestId ?? "cart"} requestId={route.requestId} />}
        {route.name === "customForm" && <CustomRequestPage key={route.productId} productId={route.productId} />}
        {route.name === "request" && <RequestPage key={route.id} id={route.id} />}
        {route.name === "order" && <OrderPage key={route.id} id={route.id} />}
        {isHome && <Landing />}
      </main>

      {isHome && (
        <>
          <ArtisanCta />
          <TextileDivider />
        </>
      )}
      <Footer />

      {isHome && <FloatingActions />}
      <Assistant />
      <ProductDetailModal />
      <CartModal />
    </>
  );
}
