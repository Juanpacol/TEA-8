"""WGS84 lon/lat to EPSG:5070 (NAD83 / Conus Albers), without extra dependencies.

CropScape needs coordinates in meters in this projection. Formulas from
Snyder, "Map Projections: A Working Manual", Albers equal-area conic, GRS80.
"""

from math import asin, cos, log, pi, radians, sin, sqrt

A = 6378137.0
F = 1 / 298.257222101
E2 = F * (2 - F)
E = sqrt(E2)
LAT1, LAT2, LAT0, LON0 = map(radians, (29.5, 45.5, 23.0, -96.0))


def _m(phi: float) -> float:
    return cos(phi) / sqrt(1 - E2 * sin(phi) ** 2)


def _q(phi: float) -> float:
    s = sin(phi)
    return (1 - E2) * (s / (1 - E2 * s * s) - log((1 - E * s) / (1 + E * s)) / (2 * E))


_N = (_m(LAT1) ** 2 - _m(LAT2) ** 2) / (_q(LAT2) - _q(LAT1))
_C = _m(LAT1) ** 2 + _N * _q(LAT1)
_RHO0 = A * sqrt(_C - _N * _q(LAT0)) / _N


def to_conus_albers(lon: float, lat: float) -> tuple:
    rho = A * sqrt(_C - _N * _q(radians(lat))) / _N
    theta = _N * (radians(lon) - LON0)
    return rho * sin(theta), _RHO0 - rho * cos(theta)
