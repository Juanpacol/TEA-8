# Manual inputs

Files here were obtained by hand from a public query tool, not by a script in `pipeline/download/`. Each one records where it came from so it can be repeated or checked.

## `nass_mclean_corn_yield.csv`

County yield of corn for grain, McLean County, Illinois, 2001 to 2025.

- Source: USDA National Agricultural Statistics Service, QuickStats (https://quickstats.nass.usda.gov/). No account or key is needed for the web query.
- Filters: Program SURVEY, Sector CROPS, Group FIELD CROPS, Commodity CORN, Category YIELD, Data Item "CORN, GRAIN - YIELD, MEASURED IN BU / ACRE", Geographic level COUNTY, State ILLINOIS, County MCLEAN. Domain TOTAL, not specified.
- Queried on November 14, 2026. The query returned 101 rows (1925 onward); only 2001 to 2025 are kept, to match the climate baseline.
- Values were copied from the results table on screen, not from a downloaded file. `cv_percent` is empty where the table showed "..." (2018, 2019) or nothing (2017 and earlier).

QuickStats yields come from NASS surveys of farm operators and are published as county estimates. They are not measurements of single fields and do not say which rotation was used.

## `nass_mclean_soybean_yield.csv`

County yield of soybeans, McLean County, Illinois, 2001 to 2025. Same source, same filters and same query date as the corn file, with Commodity SOYBEANS and Data Item "SOYBEANS - YIELD, MEASURED IN BU / ACRE". The query returned 99 rows (1996 onward); 2001 to 2025 are kept.

The results table gave an empty value for some years when read as text (2025, 2019 and 2001 to 2011), so those values were read from screenshots of the table. `cv_percent` is empty where the table showed "..." (2019) or nothing (2018 and earlier). Four years in a row (2004 to 2007) and 2002 and 2009 show exactly 54; this is what the table showed.
