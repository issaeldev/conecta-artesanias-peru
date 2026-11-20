import { useEffect, useState, type KeyboardEvent } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { useCatalog } from "@/state/CatalogProvider";
import { useProductModal } from "@/state/ProductModalProvider";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ANDES_POINTS, LIMA, PEAK_POINTS, PERU_PATH, REGION_POSITIONS, TITICACA_PATH } from "@/lib/peruMap";
import type { Region } from "@/types/domain";
import "./RegionMap.css";

const AUTOPLAY_MS = 5500;
const FADE_MS = 160;

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
              <path d={TITICACA_PATH} fill="#9fd3dc" stroke="#5aa9b5" strokeWidth="1" />
              <polyline
                points={ANDES_POINTS}
                fill="none"
                stroke="#c98b5f"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity=".18"
              />
              <polyline
                points={ANDES_POINTS}
                fill="none"
                stroke="#c98b5f"
                strokeWidth="1.5"
                strokeDasharray="4 5"
                opacity=".7"
              />
              {PEAK_POINTS.map(([x, y]) => (
                <polygon
                  key={`${x}-${y}`}
                  points={`${x},${y - 9} ${x - 6},${y + 3} ${x + 6},${y + 3}`}
                  fill="#c98b5f"
                  opacity=".6"
                />
              ))}
              <text x="22" y="350" fontSize="11" fontStyle="italic" fill="#4f8d92">
                {t.map.ocean}
              </text>
              <circle cx={LIMA[0]} cy={LIMA[1]} r="3.5" fill="#6e5a63" />
              <text x={LIMA[0] - 7} y={LIMA[1] + 4} textAnchor="end" fontSize="11" fill="#6e5a63">
                {t.map.capital}
              </text>
              {regions.map((r, k) => {
                const [x, y] = REGION_POSITIONS[r.id] ?? [r.map.x, r.map.y];
                const { labelSide } = r.map;
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
