import { useI18n } from "../../shared/i18n/index.ts";
import { COUNTY_OUTLINE, COUNTY_NAME } from "../map/county.ts";
import ndvi from "./assets/mclean-ndvi.webp";
import { percentFromUsual } from "../yields/yields.ts";
import type { McleanStory } from "./stats.ts";
import "./landing.css";

const SOURCES = [
  {
    label: "mclean.source.ranking",
    href: "https://www.wglt.org/local-news/2023-06-06/corn-and-soybean-king-mclean-county-farmers-led-state-nation-in-2022-production",
  },
  {
    label: "mclean.source.yield",
    href: "https://ilcorn.org/news-and-media/current-news/article/illinois-averages-105-bushelsacre-in-2012",
  },
  {
    label: "mclean.source.income",
    href: "https://www.farmprogress.com/business/ifes-2012-2013-projected-crop-farm-incomes-a-drought-reprieve",
  },
] as const;

// Bounding box of the NASA image (degrees); the picture is linear in lon/lat, so the outline maps with a straight scale.
const BOX = { west: -89.4, east: -88.33, south: 40.2, north: 40.84 };
const VIEW = { width: 1000, height: 786 };
const OUTLINE = (
  COUNTY_OUTLINE.features[0].geometry as GeoJSON.Polygon
).coordinates[0]
  .map(
    ([lon, lat]) =>
      `${(((lon - BOX.west) / (BOX.east - BOX.west)) * VIEW.width).toFixed(1)},${(((BOX.north - lat) / (BOX.north - BOX.south)) * VIEW.height).toFixed(1)}`,
  )
  .join(" ");

/** Why this county: what is at stake there, the year that shows it, and what the tool adds. The figures of the year come from the data file. */
export function WhyMclean({ story }: { story: McleanStory | null }) {
  const { t } = useI18n();
  return (
    <section className="section mclean">
      <div className="mclean__art" aria-hidden="true" />
      <h2>{t("mclean.title")}</h2>
      <p>{t("mclean.scale")}</p>
      <figure className="mclean-figure">
        <div className="mclean-figure__frame">
          <img
            src={ndvi}
            width={VIEW.width}
            height={VIEW.height}
            alt={t("mclean.image.alt", { county: COUNTY_NAME })}
            decoding="async"
          />
          <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} aria-hidden="true">
            <polygon points={OUTLINE} />
          </svg>
        </div>
        <figcaption className="section__note">
          {t("mclean.image.caption")}
        </figcaption>
      </figure>
      <div className="mclean__block">
        <p className="section__big">{t("problem.big")}</p>
        <p>{t("problem.text")}</p>
        <p className="section__note">{t("problem.note")}</p>
      </div>
      <div className="mclean__block">
        {story && story.cornChange !== null && (
          <p>
            {story.droughtShare !== null
              ? t("mclean.year", {
                  year: story.year,
                  change: percentFromUsual(t, story.cornChange),
                  share: Math.round(story.droughtShare),
                })
              : t("mclean.yearBasic", {
                  year: story.year,
                  change: percentFromUsual(t, story.cornChange),
                })}
          </p>
        )}
        <p>{t("mclean.income")}</p>
      </div>
      <div className="mclean__block">
        <p>{t("mclean.why")}</p>
        <p className="section__note">
          {t("mclean.sources")}{" "}
          {SOURCES.map((source, index) => (
            <span key={source.href}>
              {index > 0 && " · "}
              <a href={source.href}>{t(source.label)}</a>
            </span>
          ))}
          .
        </p>
      </div>
    </section>
  );
}
