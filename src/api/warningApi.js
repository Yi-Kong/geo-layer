import { getJSON } from "./httpClient";

export function fetchWarnings() {
  return getJSON("/geo/warnings");
}

export function fetchWarningRules() {
  return getJSON("/geo/warning-rules");
}

export function fetchWarningStats() {
  return getJSON("/geo/warning-stats");
}

export function fetchMeasurePoints() {
  return getJSON("/geo/measure-points");
}

export function fetchTreatmentMeasures() {
  return getJSON("/geo/treatment-measures");
}
