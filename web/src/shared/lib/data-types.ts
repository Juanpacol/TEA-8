/* Generated from pipeline/schema/tea8.schema.json by npm run types. Do not edit. */

/**
 * Where a statement or figure comes from. 'citation' is a source that was opened and read; 'citation_to_verify' is one that was not. Every statement carries one.
 */
export type Origin = "nasa_data" | "platform_calculation" | "model_text" | "citation" | "citation_to_verify";

/**
 * Contract between pipeline/ (writer) and web/ (reader). Changed only from the backend worktree, through a pull request.
 */
export interface TEA8DataFile {
  schema_version: "1";
  /**
   * True when the file holds illustrative data. The interface must label it as simulated.
   */
  simulated: boolean;
  generated_at: string;
  region: Region;
  /**
   * Summer (June to August) climate summary per year, at the case points.
   */
  seasons: Season[];
  /**
   * Three rotations: the current one and two alternatives.
   *
   * @minItems 3
   * @maxItems 3
   */
  rotations: [Rotation, Rotation, Rotation];
  /**
   * Known data limits, shown in the interface.
   */
  limits?: string[];
  dry_summer_rule?: DrySummerRule;
  /**
   * County yields of corn and soybeans, 2001 onward.
   */
  yields?: YieldRecord[];
}
export interface Region {
  name: string;
  state: string;
  /**
   * @minItems 1
   */
  case_points: [CasePoint, ...CasePoint[]];
  /**
   * Places to orient by and to pick from the town list. Coordinates checked against OpenStreetMap.
   */
  reference_towns?: {
    name: string;
    lat: number;
    lon: number;
  }[];
}
export interface CasePoint {
  id: string;
  label: string;
  lon: number;
  lat: number;
  soil: {
    name: string;
    drainage: string;
    hydrologic_group: string;
    organic_matter: Figure;
    available_water: Figure;
  };
  crop_history: {
    year: number;
    crop: string | null;
    source: string;
    queried_on: string;
  }[];
}
/**
 * A number with its provenance. value is null when the data is unknown; it is never filled with zero.
 */
export interface Figure {
  value: number | null;
  unit: string;
  source: string;
  parameter: string;
  queried_on: string;
}
export interface Season {
  year: number;
  root_wetness: Figure;
  root_wetness_deviation: Figure;
  rainfall: Figure;
  temperature: Figure;
  drought_monitor?: Figure1;
  /**
   * True when the summer is dry under dry_summer_rule. null when the root-zone wetness is unknown.
   */
  dry?: boolean | null;
}
/**
 * A number with its provenance. value is null when the data is unknown; it is never filled with zero.
 */
export interface Figure1 {
  value: number | null;
  unit: string;
  source: string;
  parameter: string;
  queried_on: string;
}
export interface Rotation {
  id: string;
  name: string;
  is_current: boolean;
  /**
   * True for alternatives that do not exist in the observed fields.
   */
  hypothetical: boolean;
  /**
   * Crops in order, one per year of the cycle.
   *
   * @minItems 1
   */
  sequence: [string, ...string[]];
  rules: Rule[];
  summer_field_share?: Figure2;
  explanation: {
    why: Statement[];
    evidence: Statement[];
    gaps: Statement[];
    risks: Statement[];
  };
}
/**
 * A visible, cited rule behind a rotation. Rules are computed by the pipeline; the web app only displays them.
 */
export interface Rule {
  id: string;
  text: string;
  origin: Origin;
  citation?: string;
  /**
   * Marks a read source that cautions against the rotation. It is shown under risks, not as supporting evidence.
   */
  kind?: "risk";
}
/**
 * A number with its provenance. value is null when the data is unknown; it is never filled with zero.
 */
export interface Figure2 {
  value: number | null;
  unit: string;
  source: string;
  parameter: string;
  queried_on: string;
}
/**
 * One sentence of an explanation with its origin label.
 */
export interface Statement {
  text: string;
  origin: Origin;
  /**
   * Source reference, when the origin is a citation.
   */
  citation?: string;
}
/**
 * How a summer is marked dry. One number, written down so that it can be questioned.
 */
export interface DrySummerRule {
  threshold: number;
  unit: string;
  baseline: string;
  rationale: string;
}
/**
 * County yield of one crop in one year, with the yield expected from the trend of the non-dry summers and the change against it.
 */
export interface YieldRecord {
  year: number;
  crop: "corn" | "soybeans";
  yield: Figure;
  expected: Figure;
  change_vs_trend: Figure;
}
