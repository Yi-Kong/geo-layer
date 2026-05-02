import { request } from "./httpClient";

export function fetchWorkingFaces() {
  return request.get("/geo/working-faces");
}

export function fetchRoadways() {
  return request.get("/geo/roadways");
}

export function fetchTunnels() {
  return fetchRoadways();
}

export function fetchMiningAreas() {
  return request.get("/geo/mining-areas");
}

export function fetchMiningPaths() {
  return request.get("/geo/mining-paths");
}

export function fetchProductionDynamics() {
  return request.get("/geo/production/dynamics");
}

export function fetchProductionAdvance() {
  return request.get("/geo/production/advance");
}

export function fetchWorkfaceStatus() {
  return request.get("/geo/production/workface-status");
}
