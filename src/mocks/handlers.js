import { delay, http, HttpResponse } from "msw";
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
  layerGroups,
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

const MOCK_DELAY = 150;

function clone(data) {
  return structuredClone(data);
}

async function json(data) {
  await delay(MOCK_DELAY);

  return HttpResponse.json(clone(data));
}

function getRiskBodies() {
  return [
    ...goafWaterAreas,
    ...waterRichAreas,
    ...gasRichAreas,
    ...smallMineDamageAreas,
    ...goafAreas,
    ...faultInfluenceZones,
  ];
}

async function getGeologyLayers() {
  await delay(MOCK_DELAY);

  const response = await fetch("/data/geology-layers.json");

  if (!response.ok) {
    return new HttpResponse(null, { status: response.status });
  }

  return HttpResponse.json(clone(await response.json()));
}

export const handlers = [
  http.get("/api/geo/mine", () => json(mineInfo)),
  http.get("/api/geo/strata", () => json(strata)),
  http.get("/api/geo/coal-seams", () => json(coalSeams)),
  http.get("/api/geo/boreholes", () => json(boreholes)),
  http.get("/api/geo/faults", () => json(faults)),
  http.get("/api/geo/collapse-columns", () => json(collapseColumns)),
  http.get("/api/geo/working-faces", () => json(workingFaces)),
  http.get("/api/geo/water-areas", () => json(waterRichAreas)),
  http.get("/api/geo/gas-areas", () => json(gasRichAreas)),
  http.get("/api/geo/risk-bodies", () => json(getRiskBodies())),
  http.get("/api/geo/layer-definitions", () => json(layerDefinitions)),
  http.get("/api/geo/layer-groups", () => json(layerGroups)),
  http.get("/api/geo/warnings", () => json(warnings)),
  http.get("/api/geo/geology-layers", getGeologyLayers),
  http.get("/api/geo/tunnels", () => json(tunnels)),
  http.get("/api/geo/mining-paths", () => json(miningPaths)),
  http.get("/api/geo/aquifers", () => json(aquifers)),
  http.get("/api/geo/goaf-water-areas", () => json(goafWaterAreas)),
  http.get("/api/geo/water-inrush-points", () => json(waterInrushPoints)),
  http.get("/api/geo/water-rich-areas", () => json(waterRichAreas)),
  http.get("/api/geo/gas-rich-areas", () => json(gasRichAreas)),
  http.get("/api/geo/gas-content-points", () => json(gasContentPoints)),
  http.get("/api/geo/gas-pressure-points", () => json(gasPressurePoints)),
  http.get("/api/geo/soft-layers", () => json(softLayers)),
  http.get("/api/geo/small-mine-damage-areas", () =>
    json(smallMineDamageAreas)
  ),
  http.get("/api/geo/goaf-areas", () => json(goafAreas)),
  http.get("/api/geo/abandoned-shafts", () => json(abandonedShafts)),
  http.get("/api/geo/poor-sealed-boreholes", () =>
    json(poorSealedBoreholes)
  ),
  http.get("/api/geo/fault-influence-zones", () =>
    json(faultInfluenceZones)
  ),
  http.get("/api/geo/risk-ranges", () => json(riskRanges)),
  http.get("/api/geo/measure-points", () => json(measurePoints)),
];
