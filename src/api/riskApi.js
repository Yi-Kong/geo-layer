import { request } from "./httpClient";

export function fetchRiskBodies() {
  return request.get("/geo/risk-bodies");
}

export function fetchGoafAreas() {
  return request.get("/geo/risk/goaf-areas");
}

export function fetchSmallMineDamageAreas() {
  return request.get("/geo/risk/small-mine-damage-areas");
}

export function fetchFaultInfluenceZones() {
  return request.get("/geo/risk/fault-influence-zones");
}

export function fetchAbandonedShafts() {
  return request.get("/geo/risk/abandoned-shafts");
}

export function fetchPoorSealedBoreholes() {
  return request.get("/geo/risk/poor-sealed-boreholes");
}

export function fetchRiskRanges() {
  return request.get("/geo/risk-ranges");
}
