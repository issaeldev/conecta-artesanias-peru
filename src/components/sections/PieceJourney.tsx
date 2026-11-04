import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { journeySteps } from "@/data/journey";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { SectionHeading } from "@/components/ui/SectionHeading";
import "./PieceJourney.css";

/** "El camino de una pieza": pasos con barra de avance, foto o puntos clave. */
export function PieceJourney() {
  const { t, locale } = useI18n();
  const [current, setCurrent] = useState(0);
  const step = journeySteps[current];
  const progress = ((current + 1) / journeySteps.length) * 100;

  return (
    <section id="camino" className="band">
      <div className="w">
        <SectionHeading title={t.journey.title} sub={t.journey.sub} />
        <div className="row">
          {journeySteps.map((s, i) => (
            <Chip key={s.id} active={i === current} onClick={() => setCurrent(i)}>
              {s.title[locale]}
            </Chip>
          ))}
        </div>
        <div className="pbar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <div className="camgrid">
          <div className="ph" style={step.photo ? undefined : { aspectRatio: "auto" }}>
            {step.photo ? (
              <img
                src={step.photo.src}
                alt={step.title[locale]}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: step.photo.position }}
              />
            ) : (
              step.highlights && (
                <div className="inf">
                  <ul>
                    {step.highlights[locale].map((h) => (
                      <li key={h.label}>
                        <b>{h.label}</b> {h.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>
          <Card id="stept">
            <h3>{step.title[locale]}</h3>
            <p>{step.body[locale]}</p>
            <div className="cult">
              <b>{t.journey.culturalValue}</b> {step.culturalValue[locale]}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
