import { useEffect, useState } from "react";
import { AskPanel, askTopics } from "../../features/ask/index.ts";
import { FieldCards, FieldPanel } from "../../features/field/index.ts";
import {
  EvidenceSection,
  Limits,
  Notice,
  OriginKey,
  SimulatedNotice,
} from "../../features/evidence/index.ts";
import {
  BaseControl,
  CompareControl,
  DEFAULT_BASE,
  Glossary,
  MapLegend,
  MapView,
  NDVI_FIRST_YEAR,
  NDVI_LAST_YEAR,
  WhereAmI,
  YearControl,
  pointAt,
  yearBars,
  type BaseId,
  type Place,
} from "../../features/map/index.ts";
import {
  PriorityPicker,
  orderTabs,
  type Priority,
} from "../../features/priorities/index.ts";
import { driestSummer } from "../../features/landing/index.ts";
import { PlacePanel, ZonePanel, sharedFromHash } from "../../features/place/index.ts";
import { ZoneControl, type Corner } from "../../features/zone/index.ts";
import { YearOutcome } from "../../features/yields/index.ts";
import {
  CompareTable,
  RotationPicker,
  rotationName,
  useRotations,
} from "../../features/rotations/index.ts";
import {
  SeasonStrip,
  isAfterBaseline,
  seasonOf,
} from "../../features/season/index.ts";
import { DEFAULT_BASELINE, baselineRange } from "../../shared/lib/baseline.ts";
import { pointName, useI18n } from "../../shared/i18n/index.ts";
import { Tabs } from "../../shared/components/index.ts";
import type { useData } from "../../shared/hooks/useData.ts";
import type { TEA8DataFile } from "../../shared/lib/data-types.ts";
import "./tool.css";

function Workspace({ data }: { data: TEA8DataFile }) {
  const { t } = useI18n();
  const [year, setYear] = useState(
    () =>
      (baselineRange(data.dry_summer_rule?.baseline ?? DEFAULT_BASELINE) ?? [
        0, 2023,
      ])[1],
  );
  const [compareYear, setCompareYear] = useState<number | null>(null);
  const [base, setBase] = useState<BaseId>(DEFAULT_BASE);
  const [showVegetation, setShowVegetation] = useState(true);
  const [showSoils, setShowSoils] = useState(false);
  const [priority, setPriority] = useState<Priority | null>(null);
  // A shared link (#/tool?place=… or #/tool?zone=…) reopens that place or field.
  const [shared] = useState(() => sharedFromHash(window.location.hash));
  const [place, setPlace] = useState<Place | null>(
    shared && "place" in shared ? shared.place : null,
  );
  const [zone, setZone] = useState<Corner[]>(
    shared && "zone" in shared ? shared.zone : [],
  );
  const [drawing, setDrawing] = useState(false);
  // A shared link opened while the tool is already on screen.
  useEffect(() => {
    const onHash = () => {
      const next = sharedFromHash(window.location.hash);
      if (!next) return;
      setDrawing(false);
      if ("place" in next) setPlace(next.place);
      else setZone(next.zone);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const { summaries, selectedId, selected, select } = useRotations(data);
  const point = data.region.case_points[0];
  const baseline = data.dry_summer_rule?.baseline ?? DEFAULT_BASELINE;
  const baselineLast = (baselineRange(baseline) ?? [0, year])[1];
  const driest = driestSummer(data.seasons, baseline);
  const topics = askTopics({
    driestYear: driest?.year ?? null,
    lastYear: baselineLast,
    baseline,
  });
  const chosen = place ? pointAt(place, data.region.case_points) : null;

  return (
    <>
      {data.simulated && <SimulatedNotice />}
      <div className="workspace">
        <header className="workspace__top">
          <YearControl
            year={year}
            onChange={setYear}
            bars={yearBars(data.seasons, NDVI_FIRST_YEAR, NDVI_LAST_YEAR)}
          />
          <SeasonStrip
            year={year}
            season={seasonOf(data.seasons, year)}
            pointLabel={pointName(t, point.label)}
            baseline={data.dry_summer_rule?.baseline}
            afterBaseline={isAfterBaseline(
              data.dry_summer_rule?.baseline,
              year,
            )}
          />
        </header>

        <div className="workspace__map">
          <span className="step-tag">{t("step.1")}</span>
          <p className="map-hint">{t("tool.where")}</p>
          <WhereAmI
            towns={data.region.reference_towns ?? []}
            onSelect={setPlace}
          />
          <FieldCards
            points={data.region.case_points}
            year={year}
            selectedId={chosen?.id ?? null}
            onSelect={(p) => setPlace({ lat: p.lat, lon: p.lon })}
          />
          <MapView
            points={data.region.case_points}
            year={year}
            compareYear={compareYear === year ? null : compareYear}
            base={base}
            showVegetation={showVegetation}
            showSoils={showSoils}
            selected={place}
            onSelect={setPlace}
            zone={zone}
            drawing={drawing}
            onAddCorner={(corner) => setZone((current) => [...current, corner])}
          />
          <ZoneControl
            corners={zone}
            drawing={drawing}
            onStart={() => {
              setZone([]);
              setDrawing(true);
              // To draw on the land the photo must be seen: the vegetation colors would cover it.
              setBase("aerial");
              setShowVegetation(false);
            }}
            onFinish={() => setDrawing(false)}
            onUndo={() => setZone((current) => current.slice(0, -1))}
            onClear={() => {
              setZone([]);
              setDrawing(false);
            }}
            onLoad={(corners) => {
              setDrawing(false);
              setZone(corners);
            }}
          />
          <p className="map-hint map-hint--small">{t("tool.mapHint")}</p>
          {!drawing && zone.length >= 3 && <ZonePanel corners={zone} />}
          {place && !chosen && <PlacePanel place={place} />}
          <div className="map-toolbar">
            <BaseControl
              value={base}
              onChange={setBase}
              showVegetation={showVegetation}
              onShowVegetation={setShowVegetation}
              {...(chosen ? { showSoils, onShowSoils: setShowSoils } : {})}
            />
            <CompareControl
              year={year}
              compareYear={compareYear}
              onChange={setCompareYear}
              driestYear={driest?.year}
            />
          </div>
          {showVegetation && <MapLegend year={year} />}
          <Glossary />
        </div>

        <div className="workspace__side">
          <span className="step-tag">{t("step.2")}</span>
          <h3 className="workspace__question">{t("tool.question")}</h3>
          <RotationPicker
            summaries={summaries}
            selectedId={selectedId}
            onSelect={select}
          />
          <PriorityPicker value={priority} onChange={setPriority} />
          <span className="step-tag">{t("step.3")}</span>
          {selected && (
            <Tabs
              key={priority ?? "none"}
              label={t("tool.tabsLabel", { name: rotationName(t, selected) })}
              tabs={orderTabs(
                [
                  {
                    id: "year",
                    label: String(year),
                    content: (
                      <YearOutcome
                        data={data}
                        rotation={selected}
                        year={year}
                      />
                    ),
                  },
                  {
                    id: "why",
                    label: t("tab.why"),
                    content: (
                      <div key={selected.id} className="fade-in">
                        <EvidenceSection
                          title={t("evidence.whyTitle")}
                          statements={selected.explanation.why}
                        />
                        <EvidenceSection
                          title={t("evidence.evidenceTitle")}
                          statements={selected.explanation.evidence}
                        />
                        <OriginKey />
                      </div>
                    ),
                  },
                  {
                    id: "field",
                    label: t("tab.field"),
                    content: (
                      <FieldPanel
                        points={data.region.case_points}
                        year={year}
                        onSelectYear={setYear}
                        place={place}
                        onShowOnMap={setPlace}
                      />
                    ),
                  },
                  {
                    id: "compare",
                    label: t("tab.compare"),
                    content: (
                      <CompareTable
                        data={data}
                        year={year}
                        selectedId={selectedId}
                        onSelect={select}
                      />
                    ),
                  },
                  {
                    id: "missing",
                    label: t("tab.missing", {
                      n:
                        selected.explanation.gaps.length +
                        selected.explanation.risks.length,
                    }),
                    content: (
                      <div key={selected.id} className="fade-in">
                        <EvidenceSection
                          title={t("evidence.gapsTitle")}
                          statements={selected.explanation.gaps}
                        />
                        <EvidenceSection
                          title={t("evidence.risksTitle")}
                          statements={selected.explanation.risks}
                        />
                      </div>
                    ),
                  },
                  {
                    id: "ask",
                    label: t("tab.ask"),
                    content: <AskPanel rotation={selected} topics={topics} />,
                  },
                  {
                    id: "limits",
                    label: t("tab.limits"),
                    content: <Limits limits={data.limits ?? []} />,
                  },
                ],
                priority,
              )}
            />
          )}
        </div>
      </div>
    </>
  );
}

/** The tool section of the page: one workspace that fits a screen, so nobody has to scroll to use it. */
export function ToolSection({ state }: { state: ReturnType<typeof useData> }) {
  const { t } = useI18n();
  return (
    <section
      id="tool"
      className="tool-section"
      aria-label={t("tool.sectionLabel")}
    >
      <Notice />
      {state.status === "loading" && <p>{t("tool.loading")}</p>}
      {state.status === "error" && (
        <p>{t("tool.error", { message: state.message })}</p>
      )}
      {state.status === "ready" && <Workspace data={state.data} />}
    </section>
  );
}
