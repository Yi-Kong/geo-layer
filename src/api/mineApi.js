import { request } from "./httpClient";

export function fetchMine() {
  return request.get("/geo/mine");
}

export function fetchMineInfo() {
  return fetchMine();
}

export function fetchMineOverview() {
  return request.get("/geo/mine/overview");
}

export function fetchMineLocation() {
  return request.get("/geo/mine/location");
}

export function fetchMineStructureStats() {
  return request.get("/geo/mine/structure-stats");
}

export function fetchMineWaterStats() {
  return request.get("/geo/mine/water-stats");
}

export function fetchMineProductionStats() {
  return request.get("/geo/mine/production-stats");
}
