import { request } from "./httpClient";

export function fetchGasRichAreas() {
  return request.get("/geo/gas/rich-areas");
}

export function fetchGasContentPoints() {
  return request.get("/geo/gas/content-points");
}

export function fetchGasPressurePoints() {
  return request.get("/geo/gas/pressure-points");
}

export function fetchGasStats() {
  return request.get("/geo/gas/stats");
}

export function fetchGas() {
  return request.get("/geo/gas");
}

export function fetchGasAreas() {
  return fetchGasRichAreas();
}

export function fetchSoftLayers() {
  return request.get("/geo/gas/soft-layers");
}
