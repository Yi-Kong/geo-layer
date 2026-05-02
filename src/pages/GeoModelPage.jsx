import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import GeoScene from "../components/geo3d/GeoScene";
import AdvanceSlider from "../components/mining/AdvanceSlider";
import InfoPanel from "../components/panels/InfoPanel";
import LayerPanel from "../components/panels/LayerPanel";
import WarningPanel from "../components/panels/WarningPanel";
import WorkingFaceInfoPanel from "../components/panels/WorkingFaceInfoPanel";
import {
  fetchAbandonedShafts,
  fetchAquifers,
  fetchBoreholes,
  fetchCoalSeams,
  fetchCollapseColumns,
  fetchFaultInfluenceZones,
  fetchFaults,
  fetchGasContentPoints,
  fetchGasPressurePoints,
  fetchGasRichAreas,
  fetchGoafAreas,
  fetchGoafWaterAreas,
  fetchMeasurePoints,
  fetchMineInfo,
  fetchMiningPaths,
  fetchPoorSealedBoreholes,
  fetchRiskBodies,
  fetchRiskRanges,
  fetchSmallMineDamageAreas,
  fetchSoftLayers,
  fetchStrata,
  fetchTunnels,
  fetchWarnings,
  fetchWaterInrushPoints,
  fetchWaterRichAreas,
  fetchWorkingFaces,
} from "../api/geoApi";
import { useLayerControl } from "../hooks/useLayerControl";
import {
  getAbandonedShafts,
  getAquifers,
  getBoreholes,
  getCollapseColumns,
  getCoalSeams,
  getFaultInfluenceZones,
  getFaults,
  getGasContentPoints,
  getGasPressurePoints,
  getGasRichAreas,
  getGoafAreas,
  getGoafWaterAreas,
  getMineInfo,
  getMeasurePoints,
  getMiningPaths,
  getPoorSealedBoreholes,
  getRiskRanges,
  getRiskBodies,
  getSmallMineDamageAreas,
  getSoftLayers,
  getStrata,
  getTunnels,
  getWarningPoints,
  getWaterInrushPoints,
  getWaterRichAreas,
  getWorkingFaces,
} from "../services/mockDataService";
import { generateWarningsByAdvance } from "../services/warningService";
import { useSelectionStore } from "../store/selectionStore";
import { useWarningStore } from "../store/warningStore";

function getDefaultWorkingFaceId(workingFaces) {
  return (
    workingFaces.find(
      (face) => face.stage === "active" || face.status === "mining"
    )?.id ||
    workingFaces[0]?.id ||
    ""
  );
}

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getAdvancePercent(current, planned) {
  if (!planned || planned <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / planned) * 100)));
}

function buildSelectedWorkingFaceObject(face, advanceDistance) {
  if (!face) {
    return null;
  }

  const currentAdvance = toFiniteNumber(advanceDistance, face.currentAdvance || 0);
  const plannedAdvance = toFiniteNumber(
    face.plannedAdvance ?? face.metrics?.plannedAdvance,
    0
  );
  const advancePercent = getAdvancePercent(currentAdvance, plannedAdvance);

  return {
    ...face,
    currentAdvance,
    advancePercent,
    metrics: {
      ...(face.metrics || {}),
      currentAdvance,
      advancePercent,
    },
  };
}

export default function GeoModelPage() {
  const {
    layerData,
    visibleLayerIds,
    selectedLayerId,
    explode,
    loading,
    setExplode,
    setSelectedLayerId,
  } = useLayerControl();
  const setSelectedObject = useSelectionStore((state) => state.setSelectedObject);
  const selectedObject = useSelectionStore((state) => state.selectedObject);
  const setWarnings = useWarningStore((state) => state.setWarnings);
  const activeWarnings = useWarningStore((state) => state.warnings);
  const [mineInfo, setMineInfo] = useState(() => getMineInfo());
  const [strata, setStrata] = useState(() => getStrata());
  const [coalSeams, setCoalSeams] = useState(() => getCoalSeams());
  const [boreholes, setBoreholes] = useState(() => getBoreholes());
  const [faults, setFaults] = useState(() => getFaults());
  const [collapseColumns, setCollapseColumns] = useState(() =>
    getCollapseColumns()
  );
  const [workingFaces, setWorkingFaces] = useState(() => getWorkingFaces());
  const [tunnels, setTunnels] = useState(() => getTunnels());
  const [miningPaths, setMiningPaths] = useState(() => getMiningPaths());
  const [aquifers, setAquifers] = useState(() => getAquifers());
  const [goafWaterAreas, setGoafWaterAreas] = useState(() =>
    getGoafWaterAreas()
  );
  const [waterInrushPoints, setWaterInrushPoints] = useState(() =>
    getWaterInrushPoints()
  );
  const [waterRichAreas, setWaterRichAreas] = useState(() =>
    getWaterRichAreas()
  );
  const [gasRichAreas, setGasRichAreas] = useState(() => getGasRichAreas());
  const [gasContentPoints, setGasContentPoints] = useState(() =>
    getGasContentPoints()
  );
  const [gasPressurePoints, setGasPressurePoints] = useState(() =>
    getGasPressurePoints()
  );
  const [softLayers, setSoftLayers] = useState(() => getSoftLayers());
  const [smallMineDamageAreas, setSmallMineDamageAreas] = useState(() =>
    getSmallMineDamageAreas()
  );
  const [goafAreas, setGoafAreas] = useState(() => getGoafAreas());
  const [abandonedShafts, setAbandonedShafts] = useState(() =>
    getAbandonedShafts()
  );
  const [poorSealedBoreholes, setPoorSealedBoreholes] = useState(() =>
    getPoorSealedBoreholes()
  );
  const [faultInfluenceZones, setFaultInfluenceZones] = useState(() =>
    getFaultInfluenceZones()
  );
  const [warningPoints, setWarningPoints] = useState(() => getWarningPoints());
  const [riskRanges, setRiskRanges] = useState(() => getRiskRanges());
  const [measurePoints, setMeasurePoints] = useState(() => getMeasurePoints());
  const [riskBodies, setRiskBodies] = useState(() => getRiskBodies());
  const defaultWorkingFaceId = getDefaultWorkingFaceId(workingFaces);
  const [advanceDistance, setAdvanceDistance] = useState(
    workingFaces.find((face) => face.id === defaultWorkingFaceId)
      ?.currentAdvance || 0
  );
  const [selectedWorkingFaceId, setSelectedWorkingFaceId] = useState(
    defaultWorkingFaceId
  );
  const [selectedRiskBodyId, setSelectedRiskBodyId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadGeoData() {
      try {
        const [
          mineInfoData,
          strataData,
          coalSeamsData,
          boreholesData,
          faultsData,
          collapseColumnsData,
          workingFacesData,
          tunnelsData,
          miningPathsData,
          aquifersData,
          goafWaterAreasData,
          waterInrushPointsData,
          waterRichAreasData,
          gasRichAreasData,
          gasContentPointsData,
          gasPressurePointsData,
          softLayersData,
          smallMineDamageAreasData,
          goafAreasData,
          abandonedShaftsData,
          poorSealedBoreholesData,
          faultInfluenceZonesData,
          warningPointsData,
          riskRangesData,
          measurePointsData,
          riskBodiesData,
        ] = await Promise.all([
          fetchMineInfo(),
          fetchStrata(),
          fetchCoalSeams(),
          fetchBoreholes(),
          fetchFaults(),
          fetchCollapseColumns(),
          fetchWorkingFaces(),
          fetchTunnels(),
          fetchMiningPaths(),
          fetchAquifers(),
          fetchGoafWaterAreas(),
          fetchWaterInrushPoints(),
          fetchWaterRichAreas(),
          fetchGasRichAreas(),
          fetchGasContentPoints(),
          fetchGasPressurePoints(),
          fetchSoftLayers(),
          fetchSmallMineDamageAreas(),
          fetchGoafAreas(),
          fetchAbandonedShafts(),
          fetchPoorSealedBoreholes(),
          fetchFaultInfluenceZones(),
          fetchWarnings(),
          fetchRiskRanges(),
          fetchMeasurePoints(),
          fetchRiskBodies(),
        ]);

        if (cancelled) {
          return;
        }

        setMineInfo(mineInfoData);
        setStrata(strataData);
        setCoalSeams(coalSeamsData);
        setBoreholes(boreholesData);
        setFaults(faultsData);
        setCollapseColumns(collapseColumnsData);
        setWorkingFaces(workingFacesData);
        setTunnels(tunnelsData);
        setMiningPaths(miningPathsData);
        setAquifers(aquifersData);
        setGoafWaterAreas(goafWaterAreasData);
        setWaterInrushPoints(waterInrushPointsData);
        setWaterRichAreas(waterRichAreasData);
        setGasRichAreas(gasRichAreasData);
        setGasContentPoints(gasContentPointsData);
        setGasPressurePoints(gasPressurePointsData);
        setSoftLayers(softLayersData);
        setSmallMineDamageAreas(smallMineDamageAreasData);
        setGoafAreas(goafAreasData);
        setAbandonedShafts(abandonedShaftsData);
        setPoorSealedBoreholes(poorSealedBoreholesData);
        setFaultInfluenceZones(faultInfluenceZonesData);
        setWarningPoints(warningPointsData);
        setRiskRanges(riskRangesData);
        setMeasurePoints(measurePointsData);
        setRiskBodies(riskBodiesData);
      } catch (error) {
        console.error("Failed to load mock geo data:", error);
      }
    }

    loadGeoData();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedSceneWorkingFaceId =
    selectedObject?.type === "working_face" ? selectedObject.id : "";
  const selectedWorkingFace = useMemo(() => {
    const sceneSelectedWorkingFace = selectedSceneWorkingFaceId
      ? workingFaces.find((face) => face.id === selectedSceneWorkingFaceId)
      : null;

    return (
      sceneSelectedWorkingFace ||
      workingFaces.find((face) => face.id === selectedWorkingFaceId) ||
      workingFaces.find(
        (face) => face.stage === "active" || face.status === "mining"
      ) ||
      workingFaces[0] ||
      null
    );
  }, [selectedSceneWorkingFaceId, selectedWorkingFaceId, workingFaces]);
  const selectedObjectRiskBodyId = useMemo(() => {
    if (!selectedObject?.id) {
      return null;
    }

    return riskBodies.some((riskBody) => riskBody.id === selectedObject.id)
      ? selectedObject.id
      : null;
  }, [riskBodies, selectedObject]);
  const effectiveSelectedRiskBodyId = selectedObject
    ? selectedObjectRiskBodyId
    : selectedRiskBodyId;

  const handleWorkingFaceChange = useCallback(
    (workingFaceId) => {
      const nextWorkingFace = workingFaces.find(
        (face) => face.id === workingFaceId
      );

      setSelectedWorkingFaceId(workingFaceId);
      setSelectedRiskBodyId(null);
      setAdvanceDistance(nextWorkingFace?.currentAdvance || 0);

      if (nextWorkingFace) {
        setSelectedObject(
          buildSelectedWorkingFaceObject(
            nextWorkingFace,
            nextWorkingFace.currentAdvance || 0
          )
        );
      }
    },
    [setSelectedObject, workingFaces]
  );

  const handleAdvanceChange = useCallback((valueOrUpdater) => {
    setAdvanceDistance((prev) => {
      const next =
        typeof valueOrUpdater === "function"
          ? valueOrUpdater(prev)
          : Number(valueOrUpdater);

      return Number.isFinite(next) ? next : prev;
    });
  }, []);

  useEffect(() => {
    setWarnings(
      generateWarningsByAdvance(workingFaces, riskBodies, advanceDistance)
    );
  }, [advanceDistance, riskBodies, setWarnings, workingFaces]);

  const handleSceneWorkingFaceSelect = useCallback((workingFace) => {
    if (!workingFace?.id) {
      return;
    }

    setSelectedWorkingFaceId(workingFace.id);
    setSelectedRiskBodyId(null);
    setAdvanceDistance(toFiniteNumber(workingFace.currentAdvance, 0));
  }, []);

  const handleSelectWarning = useCallback((warning) => {
    setSelectedRiskBodyId(warning?.riskBodyId || null);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedRiskBodyId(null);
  }, []);

  const handleSelectRiskBody = useCallback(
    (riskBodyId) => {
      setSelectedRiskBodyId(riskBodyId || null);

      const riskBody = riskBodies.find((item) => item.id === riskBodyId);

      if (riskBody) {
        setSelectedObject(riskBody);
      }
    },
    [riskBodies, setSelectedObject]
  );

  function handleSelectLegacyLayer(layerId) {
    setSelectedLayerId(layerId);
    setSelectedRiskBodyId(null);

    const layer = layerData.find((item) => item.id === layerId);

    if (layer) {
      setSelectedObject({
        ...layer,
        type: "legacy_stratum",
        code: `LEGACY-${layer.id}`,
        properties: {
          lithology: layer.lithology,
          age: layer.age,
          porosity: layer.porosity,
          permeability: layer.permeability,
          description: layer.description,
        },
      });
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950">
      <GeoScene
        layerData={layerData}
        visibleLayerIds={visibleLayerIds}
        explode={explode}
        selectedLayerId={selectedLayerId}
        onSelectLayer={handleSelectLegacyLayer}
        strata={strata}
        coalSeams={coalSeams}
        boreholes={boreholes}
        faults={faults}
        collapseColumns={collapseColumns}
        aquifers={aquifers}
        workingFaces={workingFaces}
        tunnels={tunnels}
        miningPaths={miningPaths}
        goafWaterAreas={goafWaterAreas}
        waterInrushPoints={waterInrushPoints}
        waterRichAreas={waterRichAreas}
        gasRichAreas={gasRichAreas}
        gasContentPoints={gasContentPoints}
        gasPressurePoints={gasPressurePoints}
        softLayers={softLayers}
        smallMineDamageAreas={smallMineDamageAreas}
        goafAreas={goafAreas}
        abandonedShafts={abandonedShafts}
        poorSealedBoreholes={poorSealedBoreholes}
        faultInfluenceZones={faultInfluenceZones}
        warningPoints={warningPoints}
        riskRanges={riskRanges}
        measurePoints={measurePoints}
        generatedWarnings={activeWarnings}
        riskBodies={riskBodies}
        advanceDistance={advanceDistance}
        selectedRiskBodyId={effectiveSelectedRiskBodyId}
        onClearSelection={handleClearSelection}
        onSelectWorkingFace={handleSceneWorkingFaceSelect}
      />

      <Header mineInfo={mineInfo} />

      <LayerPanel
        mineInfo={mineInfo}
        explode={explode}
        onExplodeChange={setExplode}
        legacyLoading={loading}
      />
      <WorkingFaceInfoPanel
        workingFace={selectedWorkingFace}
        workingFaces={workingFaces}
        tunnels={tunnels}
        riskBodies={riskBodies}
        warnings={activeWarnings}
        advanceDistance={advanceDistance}
        selectedWorkingFaceId={selectedWorkingFace?.id || selectedWorkingFaceId}
        onSelectWorkingFace={handleWorkingFaceChange}
        onSelectRiskBody={handleSelectRiskBody}
      />
      {selectedObject?.type && selectedObject.type !== "working_face" && (
        <InfoPanel
          coalSeams={coalSeams}
          hideEmpty
          positionClassName="fixed right-[420px] top-[84px] z-20 max-lg:hidden"
          onClearSelection={handleClearSelection}
        />
      )}
      <WarningPanel
        workingFaces={workingFaces}
        riskBodies={riskBodies}
        advanceDistance={advanceDistance}
        selectedWorkingFaceId={selectedWorkingFaceId}
        selectedRiskBodyId={effectiveSelectedRiskBodyId}
        onSelectWarning={handleSelectWarning}
        onSelectRiskBody={handleSelectRiskBody}
      />
      <AdvanceSlider
        workingFaces={workingFaces}
        selectedWorkingFaceId={selectedWorkingFaceId}
        advanceDistance={advanceDistance}
        onWorkingFaceChange={handleWorkingFaceChange}
        onAdvanceChange={handleAdvanceChange}
      />
    </div>
  );
}
