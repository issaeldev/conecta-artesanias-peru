import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { useCatalog } from "@/state/CatalogProvider";
import { useProductModal } from "@/state/ProductModalProvider";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Modal } from "@/components/ui/Modal";
import type { Locale, Workshop } from "@/types/domain";
import "./ArtisanProfiles.css";

/** Iniciales para el avatar cuando aún no hay retrato. */
function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

/** Foto del artesano; si aún no existe el archivo, muestra un fondo con sus iniciales. */
function ArtisanPhoto({ w, locale, className }: { w: Workshop; locale: Locale; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`${className ?? ""} pf-fallback`} style={{ background: w.color }} role="img" aria-label={w.cover.alt[locale]}>
        <span>{initials(w.artisanName.es)}</span>
      </div>
    );
  }
  return (
    <img
      className={className}
      src={w.cover.src}
      alt={w.cover.alt[locale]}
      loading="lazy"
      style={{ objectPosition: w.cover.position }}
      onError={() => setFailed(true)}
    />
  );
}

export function ArtisanProfiles() {
  const { t, locale } = useI18n();
  const { workshops, getProduct } = useCatalog();
  const { openProduct } = useProductModal();
  const [storyId, setStoryId] = useState<string | null>(null);
  const story = workshops.find((w) => w.id === storyId);

  return (
    <section id="perfiles">
      <div className="w">
        <SectionHeading title={t.profiles.title} sub={t.profiles.sub} />
        <div className="grid pf-grid">
          {workshops.map((w) => (
            <Card key={w.id} className="pfc">
              <div className="pf-cover">
                <ArtisanPhoto w={w} locale={locale} />
              </div>

              <div className="pf-body">
                <div className="pf-who">
                  <div className="av" style={{ background: w.color }}>
                    {w.portrait ? <img src={w.portrait} alt="" /> : <span>{initials(w.artisanName.es)}</span>}
                  </div>
                  <div>
                    <h3>{w.artisanName[locale]}</h3>
                    <div className="pf-place">
                      {w.community[locale]} · {w.regionName}
                    </div>
                  </div>
                </div>

                <blockquote className="pf-quote">«{w.quote[locale]}»</blockquote>

                <p>{w.bio[locale]}</p>

                <button type="button" className="pf-more" onClick={() => setStoryId(w.id)}>
                  {t.profiles.readStory}
                </button>

                <div className="pf-foot">
                  <div className="kv">
                    <b>{t.profiles.technique}</b>
                    <span>{w.technique[locale]}</span>
                    <b>{t.profiles.materials}</b>
                    <span>{w.materials[locale]}</span>
                  </div>
                  <div className="pf-years">
                    <strong>{w.yearsOfCraft}</strong> {t.profiles.years}
                  </div>

                  <div className="row" aria-label={t.profiles.pieces}>
                    {w.productIds.map((id) => {
                      const p = getProduct(id);
                      return p ? (
                        <Chip key={id} onClick={() => openProduct(id)}>
                          {p.name[locale]}
                        </Chip>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {story && (
        <Modal open onClose={() => setStoryId(null)} labelledBy="pf-story-title">
          <div className="pf-modal">
            <ArtisanPhoto w={story} locale={locale} className="pf-modal-cover" />
            <h3 id="pf-story-title">{story.artisanName[locale]}</h3>
            <div className="pf-place">
              {story.community[locale]} · {story.regionName}
            </div>
            <blockquote className="pf-quote">«{story.quote[locale]}»</blockquote>
            {story.story[locale].map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </Modal>
      )}
    </section>
  );
}
