import { getJSON } from "./httpClient";

export function fetchStrata() {
  return getJSON("/geo/strata");
}

export function fetchCoalSeams() {
  return getJSON("/geo/coal-seams");
}

export function fetchBoreholes() {
  return getJSON("/geo/boreholes");
}

export function fetchFaults() {
  return getJSON("/geo/faults");
}

export function fetchCollapseColumns() {
  return getJSON("/geo/collapse-columns");
}

export function fetchGeologicalStructures() {
  return getJSON("/geo/geological-structures");
}

export function fetchGeologyLayers() {
  return getJSON("/geo/geology-layers");
}
