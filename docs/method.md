# Method

How every figure in the tool is made, what it can and cannot say, and how to reproduce it. Numbers are those of the data file generated on 2026-11-14 (McLean County, Illinois).

TEA-8 compares crop rotations and shows the evidence for each. It does not say which one to choose and it does not replace a farmer's judgment or local expertise.

## Data

| Data | Source | Used for |
|---|---|---|
| Root-zone soil wetness (`GWETROOT`), rainfall, temperature, monthly, 2001 on | NASA POWER, point A, a grid of about 50 km | The dry-summer rule and the climate figures |
| Vegetation (NDVI), every 16 days | NASA GIBS, MODIS Terra tiles | The map only. It is shown, not measured by the tool |
| Root-zone soil moisture, daily since 2015 | NASA SMAP Level 4, read from NASA GIBS tiles | A satellite-driven cross-check |
| Drought maps, weekly | US Drought Monitor (NDMC, USDA, NOAA), county statistics | An independent cross-check |
| County yields, corn and soybeans | USDA NASS QuickStats, copied into `pipeline/inputs/` | What happened each year |
| Soil at two points; soil outlines | USDA Soil Data Access (SSURGO) | Soil panels and the field map |
| Crop of each year, 2008 to 2023 | USDA CropScape (CDL) | The rotation already in use |
| Usual planting and harvest dates, Illinois | USDA NASS Agricultural Handbook 628 (1997) | The share of summer with a crop in the field |

## The dry-summer rule

For each year, the summer value is the mean of the June, July and August monthly `GWETROOT` values. Its deviation is `(value - mean) / standard deviation` of the 2001 to 2023 summers (population standard deviation). A summer is **dry when the deviation is -1.0 or lower**. That cut is a project choice, not taken from a source.

Dry summers under this rule: 2005, 2006, 2012 and 2023.

How much the cut matters is shown in the tool (table "The same check at other cuts"): at -0.5 eight summers are called dry, at -1.25 and -1.5 only two. 2006 (deviation -1.04) and 2023 (-1.22) sit near the cut. The cut was not tuned to match the cross-checks below.

## Yield against trend

For each crop, a straight line is fitted by least squares to the county yields of the years that were **not** dry. That line is the expected yield of any year. The change is `yield / expected - 1`, in percent. Dry years are left out of the fit so that droughts do not pull the expected yield down. This is a simple trend, not a crop model: it says nothing about price, seed or other causes.

The **usual swing** is the standard deviation of that change over the non-dry years: about 8% for corn and about 8% for soybeans. A change is "within" the usual swing up to one standard deviation, "a bigger swing than most years" up to two, and "far outside" beyond that. Because dry years are not in the fit, a dry year is not penalized by the trend, and the swing describes ordinary years only. The words "a little" and "much" (5% and 15%) are older project choices and do not come from the data.

Result: only corn in 2012 (-44%, about 5.5 swings) is clearly outside the usual. Soybeans in 2012 (-11%) is a bigger swing than most years. 2005, 2006 and 2023 are within the usual swing for both crops.

## Soil moisture and yield

The panel plots one point per summer of 2001 to 2023 (soil-wetness deviation against corn change vs trend) and reports the Pearson correlation: **0.11 over 23 summers**, and -0.36 without 2012. The link is weak, one summer (2012) drives the picture, and a correlation does not show cause. It is a hint, not proof.

## Cross-checks

**US Drought Monitor.** For each summer, the mean over the June to August weekly maps of the share of the county in drought class D1 or worse. A summer counts as a drought summer when that share is above 50%. Of our four dry summers, three are also drought summers on the Monitor (2005 with 94%, 2012 with 95%, 2023 with 69%). 2006 is not (0%). Every summer the Monitor puts in drought, we also call dry. It is a separate method, so agreement is a good sign, not proof.

**NASA SMAP.** GIBS serves SMAP Level 4 root-zone soil moisture as colored tiles. Each color stands for a range of values in the layer's published color map (steps of 0.003 m3/m3), so a pixel is turned back into a number by looking its color up. We read the pixel at point A once a week from June to August, 2015 to 2026, and average each summer. Over those 12 summers the correlation with the NASA POWER soil moisture is **0.76**, and both rank 2023 as the driest. SMAP Level 4 is a land model corrected with satellite measurements, not a raw measurement, it starts in 2015 (so 2012 is outside it), and one cell is about 9 km wide.

## Rotations

Each rotation shows the evidence for it, what is not known and the risks that need local review. The **exposure** figure is the share of the 92 days from June 1 to August 31 in which the rotation has a crop in the field, from the usual planting and harvest dates (Handbook 628). It measures exposure to a dry summer, not yield: 100% for corn-soybean, about 80% for the three-crop rotation and about 92% for the four-crop one.

County yields exist only for corn and soybeans, so no yield is given per rotation. The alternative rotations are hypothetical: they do not exist in the observed fields and rest on the studies cited in each rotation's rules. A source is marked as read (`citation`) only after it was opened and read; otherwise it is marked `citation_to_verify`.

## Answers to questions

The question box sends the question to a language model together with a bundle of evidence from the data file. The model may cite only keys of that bundle, and code then checks every claim and every number against its source. A claim that fails is shown as not verified. If the service fails, the pre-generated explanations are shown. The answers are generated by a language model.

## Known limits

- One county, two case points. County yields are averages and say nothing about a single field.
- The soil moisture is a model estimate on a grid of about 50 km (about 9 km for SMAP): it describes the area, not a plot.
- Twenty-three baseline summers contain four dry ones and only one clear drought (2012). Statistics built on so few years are weak, and the tool says so.
- The dry-summer cut and the yield words are project choices.
- The tool shows no income or price figure.

## Reproduce

From the repository root (see `pipeline/README.md`): download each source, then `python -m pipeline.summarize.build`. It validates the result against `pipeline/schema/tea8.schema.json` and writes `web/public/data/summary.json`. The tests are `python -m unittest discover -s pipeline/tests -t .` and `npm test` in `web/`.
