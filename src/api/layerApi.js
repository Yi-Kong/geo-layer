import { request } from "./httpClient";

export function fetchLayers() {
  return request.get("/geo/layers");
}

export function fetchLayerGroups() {
  return request.get("/geo/layer-groups");
}

export function fetchLayerDefinitions() {
  return request.get("/geo/layer-definitions");
}

export function fetchLayerConfig() {
  return request.get("/geo/layer-config");
}
