import { getJSON } from "./httpClient";

export function fetchLayers() {
  return getJSON("/geo/layers");
}

export function fetchLayerGroups() {
  return getJSON("/geo/layer-groups");
}

export function fetchLayerDefinitions() {
  return getJSON("/geo/layer-definitions");
}

export function fetchLayerConfig() {
  return getJSON("/geo/layer-config");
}
