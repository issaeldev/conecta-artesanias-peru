import { useI18n } from "@/i18n/I18nProvider";
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

export default function App() {
  const { t } = useI18n();

  return (
    <>
      <ScrollProgress />
      <a className="skip" href="#top">
        {t.meta.skip}
      </a>
      <Header />

      <main id="top">
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
      </main>

      <ArtisanCta />
      <TextileDivider />
      <Footer />

      <FloatingActions />
      <ProductDetailModal />
      <CartModal />
    </>
  );
}
