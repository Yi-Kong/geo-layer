import { request } from "./httpClient";

export function fetchWarnings() {
  return request.get("/geo/warnings");
}

export function fetchWarningRules() {
  return request.get("/geo/warning-rules");
}

export function fetchWarningStats() {
  return request.get("/geo/warning-stats");
}

export function fetchMeasurePoints() {
  return request.get("/geo/measure-points");
}

export function fetchTreatmentMeasures() {
  return request.get("/geo/treatment-measures");
}
