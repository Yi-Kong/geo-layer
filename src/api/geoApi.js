import { getJSON } from "./httpClient";

export function fetchMineInfo() {
  return getJSON("/geo/mine");
}

export function fetchStrata() {
  return getJSON("/geo/strata");
}

export function fetchCoalSeams() {
  return getJSON("/geo/coal-seams");
}

export function fetchBoreholes() {
  return getJSON("/geo/boreholes");
}

export function fetchFaults() {
  return getJSON("/geo/faults");
}

export function fetchCollapseColumns() {
  return getJSON("/geo/collapse-columns");
}

export function fetchWorkingFaces() {
  return getJSON("/geo/working-faces");
}

export function fetchWaterAreas() {
  return getJSON("/geo/water-areas");
}

export function fetchGasAreas() {
  return getJSON("/geo/gas-areas");
}

export function fetchRiskBodies() {
  return getJSON("/geo/risk-bodies");
}

export function fetchLayerDefinitions() {
  return getJSON("/geo/layer-definitions");
}

export function fetchLayerGroups() {
  return getJSON("/geo/layer-groups");
}

export function fetchWarnings() {
  return getJSON("/geo/warnings");
}

export function fetchGeologyLayers() {
  return getJSON("/geo/geology-layers");
}

export function fetchTunnels() {
  return getJSON("/geo/tunnels");
}

export function fetchMiningPaths() {
  return getJSON("/geo/mining-paths");
}

export function fetchAquifers() {
  return getJSON("/geo/aquifers");
}

export function fetchGoafWaterAreas() {
  return getJSON("/geo/goaf-water-areas");
}

export function fetchWaterInrushPoints() {
  return getJSON("/geo/water-inrush-points");
}

export function fetchWaterRichAreas() {
  return getJSON("/geo/water-rich-areas");
}

export function fetchGasRichAreas() {
  return getJSON("/geo/gas-rich-areas");
}

export function fetchGasContentPoints() {
  return getJSON("/geo/gas-content-points");
}

export function fetchGasPressurePoints() {
  return getJSON("/geo/gas-pressure-points");
}

export function fetchSoftLayers() {
  return getJSON("/geo/soft-layers");
}

export function fetchSmallMineDamageAreas() {
  return getJSON("/geo/small-mine-damage-areas");
}

export function fetchGoafAreas() {
  return getJSON("/geo/goaf-areas");
}

export function fetchAbandonedShafts() {
  return getJSON("/geo/abandoned-shafts");
}

export function fetchPoorSealedBoreholes() {
  return getJSON("/geo/poor-sealed-boreholes");
}

export function fetchFaultInfluenceZones() {
  return getJSON("/geo/fault-influence-zones");
}

export function fetchRiskRanges() {
  return getJSON("/geo/risk-ranges");
}

export function fetchMeasurePoints() {
  return getJSON("/geo/measure-points");
}
