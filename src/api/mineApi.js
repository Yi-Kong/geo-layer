import { getJSON } from "./httpClient";

export function fetchMine() {
  return getJSON("/geo/mine");
}

export function fetchMineInfo() {
  return fetchMine();
}

export function fetchMineOverview() {
  return getJSON("/geo/mine/overview");
}

export function fetchMineLocation() {
  return getJSON("/geo/mine/location");
}

export function fetchMineStructureStats() {
  return getJSON("/geo/mine/structure-stats");
}

export function fetchMineWaterStats() {
  return getJSON("/geo/mine/water-stats");
}

export function fetchMineProductionStats() {
  return getJSON("/geo/mine/production-stats");
}
