import {
  coalSeams,
  gasRichAreas,
  goafWaterAreas,
  mineInfo,
  strata,
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

export function getWorkingFaces() {
  return clone(workingFaces);
}

export function getGoafWaterAreas() {
  return clone(goafWaterAreas);
}

export function getWaterRichAreas() {
  return clone(waterRichAreas);
}

export function getGasRichAreas() {
  return clone(gasRichAreas);
}

export function getRiskBodies() {
  return [
    ...getGoafWaterAreas(),
    ...getWaterRichAreas(),
    ...getGasRichAreas(),
  ];
}

export function getVisibleLayers() {
  return {
    strata: strata.some((item) => item.visible),
    coalSeams: coalSeams.some((item) => item.visible),
    workingFaces: workingFaces.some((item) => item.visible),
    goafWaterAreas: goafWaterAreas.some((item) => item.visible),
    waterRichAreas: waterRichAreas.some((item) => item.visible),
    gasRichAreas: gasRichAreas.some((item) => item.visible),
    warnings: true,
  };
}
