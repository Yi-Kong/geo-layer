import { request } from "./httpClient";

export function fetchStrata() {
  return request.get("/geo/strata");
}

export function fetchCoalSeams() {
  return request.get("/geo/coal-seams");
}

export function fetchBoreholes() {
  return request.get("/geo/boreholes");
}

export function fetchFaults() {
  return request.get("/geo/faults");
}

export function fetchCollapseColumns() {
  return request.get("/geo/collapse-columns");
}

export function fetchGeologicalStructures() {
  return request.get("/geo/geological-structures");
}

export function fetchGeologyLayers() {
  return request.get("/geo/geology-layers");
}
