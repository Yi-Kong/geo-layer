import { getJSON } from "./httpClient";

export function fetchWorkingFaces() {
  return getJSON("/geo/working-faces");
}

export function fetchRoadways() {
  return getJSON("/geo/roadways");
}

export function fetchTunnels() {
  return fetchRoadways();
}

export function fetchMiningAreas() {
  return getJSON("/geo/mining-areas");
}

export function fetchMiningPaths() {
  return getJSON("/geo/mining-paths");
}

export function fetchProductionDynamics() {
  return getJSON("/geo/production/dynamics");
}

export function fetchProductionAdvance() {
  return getJSON("/geo/production/advance");
}

export function fetchWorkfaceStatus() {
  return getJSON("/geo/production/workface-status");
}
