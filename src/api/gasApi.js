import { getJSON } from "./httpClient";

export function fetchGasRichAreas() {
  return getJSON("/geo/gas/rich-areas");
}

export function fetchGasContentPoints() {
  return getJSON("/geo/gas/content-points");
}

export function fetchGasPressurePoints() {
  return getJSON("/geo/gas/pressure-points");
}

export function fetchGasStats() {
  return getJSON("/geo/gas/stats");
}

export function fetchGas() {
  return getJSON("/geo/gas");
}

export function fetchGasAreas() {
  return fetchGasRichAreas();
}

export function fetchSoftLayers() {
  return getJSON("/geo/gas/soft-layers");
}
