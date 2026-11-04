import { useI18n } from "@/i18n/I18nProvider";
import { useCatalog } from "@/state/CatalogProvider";
import { useProductModal } from "@/state/ProductModalProvider";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { SectionHeading } from "@/components/ui/SectionHeading";
import "./ArtisanProfiles.css";

export function ArtisanProfiles() {
  const { t, locale } = useI18n();
  const { workshops, getProduct } = useCatalog();
  const { openProduct } = useProductModal();

  return (
    <section id="perfiles">
      <div className="w">
        <SectionHeading title={t.profiles.title} sub={t.profiles.sub} />
        <div className="grid">
          {workshops.map((w) => (
            <Card key={w.id} className="pfc">
              <div className="av" style={{ background: w.color }}>
                <svg viewBox="0 0 80 80" aria-hidden="true">
                  <circle cx="40" cy="30" r="14" fill="#fff3e3" />
                  <path d="M12 80c0-22 12-32 28-32s28 10 28 32z" fill="#fff3e3" />
                </svg>
              </div>
              <span className="badge">{t.profiles.badge}</span>
              <h3>{w.title[locale]}</h3>
              <div className="rg-e">{w.regionName}</div>
              <div className="kv">
                <b>{t.profiles.technique}</b>
                <span>{w.technique[locale]}</span>
                <b>{t.profiles.materials}</b>
                <span>{w.materials[locale]}</span>
              </div>
              <p>{w.bio[locale]}</p>
              <div className="row">
                {w.productIds.map((id) => {
                  const p = getProduct(id);
                  return p ? (
                    <Chip key={id} onClick={() => openProduct(id)}>
                      {p.name[locale]}
                    </Chip>
                  ) : null;
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
