import { useEffect, useState, type KeyboardEvent } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { useCatalog } from "@/state/CatalogProvider";
import { useProductModal } from "@/state/ProductModalProvider";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Region } from "@/types/domain";
import "./RegionMap.css";

const AUTOPLAY_MS = 5500;
const FADE_MS = 160;

/** Silueta referencial del Perú (viewBox 320×460). */
const PERU_PATH =
  "M29 84L46 108L62 113L77 84L89 72L132 60L149 38L149 5L170 20L204 48L264 84L277 98L262 118L254 146L211 182L199 218L223 242L259 266L286 265L307 269L302 302L286 319L300 350L295 374L300 394L288 415L288 422L266 442L240 418L216 396L185 372L151 338L122 319L106 290L79 254L58 209L38 170L10 130L5 108L14 94Z";
const MOUNTAINS = [
  [95, 196],
  [115, 250],
  [135, 320],
  [180, 372],
  [240, 402],
];

export function RegionMap() {
  const { t, locale } = useI18n();
  const { regions, getProduct } = useCatalog();
  const { openProduct } = useProductModal();

  const [current, setCurrent] = useState(0);
  const [shown, setShown] = useState(0);
  const [fading, setFading] = useState(false);
  const [playing, setPlaying] = useState(false);

  const count = regions.length;

  // Transición suave del panel al cambiar de región.
  useEffect(() => {
    if (current === shown) return;
    setFading(true);
    const id = window.setTimeout(() => {
      setShown(current);
      setFading(false);
    }, FADE_MS);
    return () => window.clearTimeout(id);
  }, [current, shown]);

  // Recorrido automático.
  useEffect(() => {
    if (!playing || count === 0) return;
    const id = window.setInterval(() => setCurrent((c) => (c + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [playing, count]);

  if (count === 0) return null;

  const select = (k: number) => {
    setPlaying(false);
    setCurrent(k);
  };
  const onMarkerKey = (e: KeyboardEvent, k: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(k);
    }
  };

  const region: Region = regions[shown] ?? regions[0];

  return (
    <section id="mapa">
      <div className="w">
        <SectionHeading title={t.map.title} sub={t.map.sub} />
        <div className="mapw">
          <div className="mapbox">
            <svg viewBox="0 0 320 460" role="img" aria-label={t.map.ariaLabel}>
              <defs>
                <linearGradient id="ld" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fff3e3" />
                  <stop offset="1" stopColor="#ffe1a8" />
                </linearGradient>
              </defs>
              <path
                style={{ fill: "url(#ld)", stroke: "#c2185b", strokeWidth: 2 }}
                strokeLinejoin="round"
                d={PERU_PATH}
              />
              <polyline
                points="75,130 95,200 118,262 140,325 185,375 245,405"
                fill="none"
                stroke="#c98b5f"
                strokeWidth="1.5"
                strokeDasharray="4 5"
                opacity=".7"
              />
              {MOUNTAINS.map(([x, y]) => (
                <polygon
                  key={`${x}-${y}`}
                  points={`${x},${y} ${x - 8},${y + 14} ${x + 8},${y + 14}`}
                  fill="#c98b5f"
                  opacity=".5"
                />
              ))}
              <text x="10" y="300" fontSize="11" fontStyle="italic" fill="#4f8d92">
                {t.map.ocean}
              </text>
              <circle cx="108" cy="290" r="3.5" fill="#6e5a63" />
              <text x="100" y="294" textAnchor="end" fontSize="11" fill="#6e5a63">
                {t.map.capital}
              </text>
              {regions.map((r, k) => {
                const { x, y, labelSide } = r.map;
                return (
                  <g
                    key={r.id}
                    className={`mk${k === current ? " on" : ""}`}
                    tabIndex={0}
                    role="button"
                    aria-label={r.name}
                    aria-pressed={k === current}
                    onClick={() => select(k)}
                    onKeyDown={(e) => onMarkerKey(e, k)}
                  >
                    <circle className="gl" cx={x} cy={y} r="34" fill={r.color} />
                    <circle className="pulse" cx={x} cy={y} r="9" fill={r.color} />
                    <circle className="dt" cx={x} cy={y} r="9" fill={r.color} stroke="#fff" strokeWidth="3" />
                    <text
                      x={labelSide === "end" ? x - 15 : x + 15}
                      y={y + 4}
                      textAnchor={labelSide === "end" ? "end" : undefined}
                    >
                      {r.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <Card id="mi" style={{ opacity: fading ? 0 : 1 }}>
            <div className="rg-e">{region.area[locale]}</div>
            <h3>{region.name}</h3>
            <p>{region.description[locale]}</p>
            <div className="kv">
              <b>{t.map.technique}</b>
              <span>{region.technique[locale]}</span>
              <b>{t.map.materials}</b>
              <span>{region.materials[locale]}</span>
            </div>
            <div className="rg-e">{t.map.pieces}</div>
            <div className="row">
              {region.productIds.map((id) => {
                const p = getProduct(id);
                return p ? (
                  <Chip key={id} onClick={() => openProduct(id)}>
                    {p.name[locale]}
                  </Chip>
                ) : null;
              })}
            </div>
          </Card>
        </div>

        <div className="row">
          {regions.map((r, k) => (
            <Chip key={r.id} active={k === current} onClick={() => select(k)}>
              {r.name}
            </Chip>
          ))}
          <Chip className="ctl" aria-label={t.map.previous} title={t.map.previous} onClick={() => select((current + count - 1) % count)}>
            ‹
          </Chip>
          <Chip
            className="ctl"
            aria-label={playing ? t.map.pause : t.map.play}
            title={playing ? t.map.pause : t.map.play}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? "❚❚" : "▶"}
          </Chip>
          <Chip className="ctl" aria-label={t.map.next} title={t.map.next} onClick={() => select((current + 1) % count)}>
            ›
          </Chip>
        </div>
      </div>
    </section>
  );
}
