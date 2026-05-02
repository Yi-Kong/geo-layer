import { request } from "./httpClient";

export function fetchGoafWaterAreas() {
  return request.get("/geo/water/goaf-water-areas");
}

export function fetchRichWaterAreas() {
  return request.get("/geo/water/rich-water-areas");
}

export function fetchWaterRichAreas() {
  return fetchRichWaterAreas();
}

export function fetchWaterInrushPoints() {
  return request.get("/geo/water/inrush-points");
}

export function fetchHydrologicalBoreholes() {
  return request.get("/geo/water/hydrological-boreholes");
}

export function fetchWaterAreas() {
  return request.get("/geo/water/areas");
}

export function fetchWaterStats() {
  return request.get("/geo/water/stats");
}

export function fetchAquifers() {
  return request.get("/geo/water/aquifers");
}
