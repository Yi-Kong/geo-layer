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

export function fetchGeologicalStructures() {
  return getJSON("/geo/geological-structures");
}

export function fetchGeologyLayers() {
  return getJSON("/geo/geology-layers");
}

export function fetchGoafWaterAreas() {
  return getJSON("/geo/water/goaf-water-areas");
}

export function fetchRichWaterAreas() {
  return getJSON("/geo/water/rich-water-areas");
}

export function fetchWaterRichAreas() {
  return fetchRichWaterAreas();
}

export function fetchWaterInrushPoints() {
  return getJSON("/geo/water/inrush-points");
}

export function fetchHydrologicalBoreholes() {
  return getJSON("/geo/water/hydrological-boreholes");
}

export function fetchWaterAreas() {
  return getJSON("/geo/water/areas");
}

export function fetchWaterStats() {
  return getJSON("/geo/water/stats");
}

export function fetchGasRichAreas() {
  return getJSON("/geo/gas/rich-areas");
}

export function fetchGasContentPoints() {
  return getJSON("/geo/gas/content-points");
}

export function fetchGasPressurePoints() {
  return getJSON("/geo/gas/pressure-points");
}

export function fetchGasStats() {
  return getJSON("/geo/gas/stats");
}

export function fetchGas() {
  return getJSON("/geo/gas");
}

export function fetchGasAreas() {
  return fetchGasRichAreas();
}

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

export function fetchWarnings() {
  return getJSON("/geo/warnings");
}

export function fetchWarningRules() {
  return getJSON("/geo/warning-rules");
}

export function fetchWarningStats() {
  return getJSON("/geo/warning-stats");
}

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

export function fetchResourceReserves() {
  return getJSON("/geo/resources/reserves");
}

export function fetchResourceStats() {
  return getJSON("/geo/resources/stats");
}

export function fetchResources() {
  return getJSON("/geo/resources");
}

export function fetchAquifers() {
  return getJSON("/geo/water/aquifers");
}

export function fetchSoftLayers() {
  return getJSON("/geo/gas/soft-layers");
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

export function fetchMeasurePoints() {
  return getJSON("/geo/measure-points");
}

export function fetchTreatmentMeasures() {
  return getJSON("/geo/treatment-measures");
}
