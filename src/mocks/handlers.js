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
  layerDefinitionMap,
  layerDefinitions,
  layerGroups,
  measurePoints,
  mineInfo,
  miningPaths,
  poorSealedBoreholes,
  riskColors,
  riskRanges,
  smallMineDamageAreas,
  softLayers,
  strata,
  treatmentMeasures,
  tunnels,
  warningRules,
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

function countBy(items, getKey) {
  return items.reduce((result, item) => {
    const key = getKey(item);

    if (key) {
      result[key] = (result[key] || 0) + 1;
    }

    return result;
  }, {});
}

function getHydrologicalBoreholes() {
  return boreholes.filter((borehole) => {
    const usage = Object.values(borehole.properties || {}).join(" ");

    return `${borehole.name} ${usage}`.includes("水文");
  });
}

function getRiskBodies() {
  return [
    ...goafWaterAreas,
    ...waterRichAreas,
    ...gasRichAreas,
    ...softLayers,
    ...smallMineDamageAreas,
    ...goafAreas,
    ...abandonedShafts,
    ...poorSealedBoreholes,
    ...faultInfluenceZones,
  ];
}

function getMineOverview() {
  return {
    ...mineInfo,
    overview: {
      strata: strata.length,
      coalSeams: coalSeams.length,
      boreholes: boreholes.length,
      workingFaces: workingFaces.length,
      riskBodies: getRiskBodies().length,
      warnings: warnings.length,
    },
  };
}

function getMineLocation() {
  return {
    id: mineInfo.id,
    code: mineInfo.code,
    name: mineInfo.name,
    location: mineInfo.location,
    coordinateSystem: mineInfo.coordinateSystem,
  };
}

function getMineStructureStats() {
  return {
    faults: faults.length,
    collapseColumns: collapseColumns.length,
    boreholes: boreholes.length,
  };
}

function getMineWaterStats() {
  return {
    aquifers: aquifers.length,
    goafWaterAreas: goafWaterAreas.length,
    waterRichAreas: waterRichAreas.length,
    waterInrushPoints: waterInrushPoints.length,
    hydrologicalBoreholes: getHydrologicalBoreholes().length,
  };
}

function getMineProductionStats() {
  return {
    workingFaces: workingFaces.length,
    activeWorkingFaces: workingFaces.filter(
      (face) => face.stage === "active" || face.status === "mining"
    ).length,
    plannedWorkingFaces: workingFaces.filter(
      (face) => face.stage === "planned" || face.status === "planned"
    ).length,
    tunnels: tunnels.length,
    miningPaths: miningPaths.length,
  };
}

function getWarningStats() {
  return {
    total: warnings.length,
    byLevel: countBy(warnings, (warning) => warning.riskLevel),
    byType: countBy(warnings, (warning) => warning.warningType),
  };
}

function getWaterStats() {
  return {
    aquifers: aquifers.length,
    goafWaterAreas: goafWaterAreas.length,
    waterRichAreas: waterRichAreas.length,
    waterInrushPoints: waterInrushPoints.length,
  };
}

function getGasStats() {
  return {
    gasRichAreas: gasRichAreas.length,
    gasContentPoints: gasContentPoints.length,
    gasPressurePoints: gasPressurePoints.length,
    softLayers: softLayers.length,
  };
}

function getLayerConfig() {
  return {
    layerGroups,
    layerDefinitions,
    riskColors,
    layerDefinitionMap,
  };
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
  http.get("/api/geo/mine/overview", () => json(getMineOverview())),
  http.get("/api/geo/mine/location", () => json(getMineLocation())),
  http.get("/api/geo/mine/structure-stats", () =>
    json(getMineStructureStats())
  ),
  http.get("/api/geo/mine/water-stats", () => json(getMineWaterStats())),
  http.get("/api/geo/mine/production-stats", () =>
    json(getMineProductionStats())
  ),

  http.get("/api/geo/strata", () => json(strata)),
  http.get("/api/geo/coal-seams", () => json(coalSeams)),
  http.get("/api/geo/boreholes", () => json(boreholes)),
  http.get("/api/geo/faults", () => json(faults)),
  http.get("/api/geo/collapse-columns", () => json(collapseColumns)),
  http.get("/api/geo/geological-structures", () =>
    json({ faults, collapseColumns, boreholes })
  ),
  http.get("/api/geo/geology-layers", getGeologyLayers),

  http.get("/api/geo/water/goaf-water-areas", () => json(goafWaterAreas)),
  http.get("/api/geo/water/rich-water-areas", () => json(waterRichAreas)),
  http.get("/api/geo/water/inrush-points", () => json(waterInrushPoints)),
  http.get("/api/geo/water/hydrological-boreholes", () =>
    json(getHydrologicalBoreholes())
  ),
  http.get("/api/geo/water/aquifers", () => json(aquifers)),
  http.get("/api/geo/water/areas", () =>
    json({
      aquifers,
      goafWaterAreas,
      waterRichAreas,
      waterInrushPoints,
      hydrologicalBoreholes: getHydrologicalBoreholes(),
    })
  ),
  http.get("/api/geo/water/stats", () => json(getWaterStats())),

  http.get("/api/geo/gas/rich-areas", () => json(gasRichAreas)),
  http.get("/api/geo/gas/content-points", () => json(gasContentPoints)),
  http.get("/api/geo/gas/pressure-points", () => json(gasPressurePoints)),
  http.get("/api/geo/gas/soft-layers", () => json(softLayers)),
  http.get("/api/geo/gas/stats", () => json(getGasStats())),
  http.get("/api/geo/gas", () =>
    json({ gasRichAreas, gasContentPoints, gasPressurePoints, softLayers })
  ),

  http.get("/api/geo/working-faces", () => json(workingFaces)),
  http.get("/api/geo/roadways", () => json(tunnels)),
  http.get("/api/geo/mining-areas", () => json(workingFaces)),
  http.get("/api/geo/mining-paths", () => json(miningPaths)),
  http.get("/api/geo/production/dynamics", () =>
    json({ workingFaces, tunnels, miningPaths })
  ),
  http.get("/api/geo/production/advance", () =>
    json(
      workingFaces.map((face) => ({
        id: face.id,
        code: face.code,
        name: face.name,
        currentAdvance: face.currentAdvance,
        plannedAdvance: face.plannedAdvance,
        monthlyAdvance: face.monthlyAdvance,
        metrics: face.metrics,
      }))
    )
  ),
  http.get("/api/geo/production/workface-status", () =>
    json(
      workingFaces.map((face) => ({
        id: face.id,
        code: face.code,
        name: face.name,
        status: face.status,
        stage: face.stage,
        stageLabel: face.stageLabel,
        riskLevel: face.riskLevel,
      }))
    )
  ),

  http.get("/api/geo/risk-bodies", () => json(getRiskBodies())),
  http.get("/api/geo/risk/goaf-areas", () => json(goafAreas)),
  http.get("/api/geo/risk/small-mine-damage-areas", () =>
    json(smallMineDamageAreas)
  ),
  http.get("/api/geo/risk/fault-influence-zones", () =>
    json(faultInfluenceZones)
  ),
  http.get("/api/geo/risk/abandoned-shafts", () => json(abandonedShafts)),
  http.get("/api/geo/risk/poor-sealed-boreholes", () =>
    json(poorSealedBoreholes)
  ),
  http.get("/api/geo/risk-ranges", () => json(riskRanges)),
  http.get("/api/geo/warnings", () => json(warnings)),
  http.get("/api/geo/warning-rules", () => json(warningRules)),
  http.get("/api/geo/warning-stats", () => json(getWarningStats())),
  http.get("/api/geo/measure-points", () => json(measurePoints)),
  http.get("/api/geo/treatment-measures", () => json(treatmentMeasures)),

  http.get("/api/geo/layers", () => json(layerDefinitions)),
  http.get("/api/geo/layer-groups", () => json(layerGroups)),
  http.get("/api/geo/layer-definitions", () => json(layerDefinitions)),
  http.get("/api/geo/layer-config", () => json(getLayerConfig())),

  http.get("/api/geo/resources/reserves", () => json([])),
  http.get("/api/geo/resources/stats", () => json({})),
  http.get("/api/geo/resources", () => json({ reserves: [], stats: {} })),

  http.get("/api/geo/water-areas", () => json(waterRichAreas)),
  http.get("/api/geo/gas-areas", () => json(gasRichAreas)),
  http.get("/api/geo/tunnels", () => json(tunnels)),
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
];
