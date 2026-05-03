import {
  abandonedShafts,
  aquifers,
  boreholes,
  collapseColumns,
  coalSeams,
  faultInfluenceZones,
  faults,
  gasContentPoints,
  gasPressurePoints,
  gasRichAreas,
  goafAreas,
  goafWaterAreas,
  layerDefinitions,
  measurePoints,
  mineInfo,
  miningPaths,
  poorSealedBoreholes,
  riskRanges,
  smallMineDamageAreas,
  softLayers,
  strata,
  tunnels,
  warnings,
  waterInrushPoints,
  waterRichAreas,
  workingFaces,
} from "../mock/index.js";

function clone(data) {
  return structuredClone(data);
}

export function getMineInfo() {
  return clone(mineInfo);
}

export function getStrata() {
  return clone(strata);
}

export function getCoalSeams() {
  return clone(coalSeams);
}

export function getBoreholes() {
  return clone(boreholes);
}

export function getFaults() {
  return clone(faults);
}

export function getCollapseColumns() {
  return clone(collapseColumns);
}

export function getWorkingFaces() {
  return clone(workingFaces);
}

export function getTunnels() {
  return clone(tunnels);
}

export function getMiningPaths() {
  return clone(miningPaths);
}

export function getGoafWaterAreas() {
  return clone(goafWaterAreas);
}

export function getAquifers() {
  return clone(aquifers);
}

export function getWaterRichAreas() {
  return clone(waterRichAreas);
}

export function getWaterInrushPoints() {
  return clone(waterInrushPoints);
}

export function getGasRichAreas() {
  return clone(gasRichAreas);
}

export function getGasContentPoints() {
  return clone(gasContentPoints);
}

export function getGasPressurePoints() {
  return clone(gasPressurePoints);
}

export function getSoftLayers() {
  return clone(softLayers);
}

export function getSmallMineDamageAreas() {
  return clone(smallMineDamageAreas);
}

export function getGoafAreas() {
  return clone(goafAreas);
}

export function getAbandonedShafts() {
  return clone(abandonedShafts);
}

export function getPoorSealedBoreholes() {
  return clone(poorSealedBoreholes);
}

export function getFaultInfluenceZones() {
  return clone(faultInfluenceZones);
}

export function getWarningPoints() {
  return clone(warnings);
}

export function getRiskRanges() {
  return clone(riskRanges);
}

export function getMeasurePoints() {
  return clone(measurePoints);
}

export function getRiskBodies() {
  return [
    ...getGoafWaterAreas(),
    ...getWaterRichAreas(),
    ...getGasRichAreas(),
    ...getSoftLayers(),
    ...getSmallMineDamageAreas(),
    ...getGoafAreas(),
    ...getAbandonedShafts(),
    ...getPoorSealedBoreholes(),
    ...getFaultInfluenceZones(),
  ];
}

export function getVisibleLayers() {
  return Object.fromEntries(
    layerDefinitions.map((layer) => [layer.id, layer.defaultVisible !== false])
  );
}
