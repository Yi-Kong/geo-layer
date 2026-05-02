import { getJSON } from "./httpClient";

export function fetchRiskBodies() {
  return getJSON("/geo/risk-bodies");
}

export function fetchGoafAreas() {
  return getJSON("/geo/risk/goaf-areas");
}

export function fetchSmallMineDamageAreas() {
  return getJSON("/geo/risk/small-mine-damage-areas");
}

export function fetchFaultInfluenceZones() {
  return getJSON("/geo/risk/fault-influence-zones");
}

export function fetchAbandonedShafts() {
  return getJSON("/geo/risk/abandoned-shafts");
}

export function fetchPoorSealedBoreholes() {
  return getJSON("/geo/risk/poor-sealed-boreholes");
}

export function fetchRiskRanges() {
  return getJSON("/geo/risk-ranges");
}
