import { getJSON } from "./httpClient";

export function fetchGoafWaterAreas() {
  return getJSON("/geo/water/goaf-water-areas");
}

export function fetchRichWaterAreas() {
  return getJSON("/geo/water/rich-water-areas");
}

export function fetchWaterRichAreas() {
  return fetchRichWaterAreas();
}

export function fetchWaterInrushPoints() {
  return getJSON("/geo/water/inrush-points");
}

export function fetchHydrologicalBoreholes() {
  return getJSON("/geo/water/hydrological-boreholes");
}

export function fetchWaterAreas() {
  return getJSON("/geo/water/areas");
}

export function fetchWaterStats() {
  return getJSON("/geo/water/stats");
}

export function fetchAquifers() {
  return getJSON("/geo/water/aquifers");
}
