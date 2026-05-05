import { useEffect } from "react";
import Header from "../components/Header";
import GeoScene from "../components/geo3d/GeoScene";
import AdvanceSlider from "../components/mining/AdvanceSlider";
import InfoPanel from "../components/panels/InfoPanel";
import LayerPanel from "../components/panels/LayerPanel";
import RiskBodyDetailPanel from "../components/panels/RiskBodyDetailPanel";
import WarningPanel from "../components/panels/WarningPanel";
import WorkingFaceInfoPanel from "../components/panels/WorkingFaceInfoPanel";
import { useGeneratedWarnings } from "../hooks/useGeneratedWarnings";
import { useGeoData } from "../hooks/useGeoData";
import { useLayerControl } from "../hooks/useLayerControl";
import { useLegacyLayerSelection } from "../hooks/useLegacyLayerSelection";
import { useRiskSelection } from "../hooks/useRiskSelection";
import { useWorkingFaceSelection } from "../hooks/useWorkingFaceSelection";
import { useLayerStore } from "../store/layerStore";
import { useSelectionStore } from "../store/selectionStore";

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
  const loadLayerConfig = useLayerStore((state) => state.loadLayerConfig);
  const {
    mineInfo,
    strata,
    coalSeams,
    boreholes,
    faults,
    collapseColumns,
    workingFaces,
    tunnels,
    miningPaths,
    aquifers,
    goafWaterAreas,
    waterInrushPoints,
    waterRichAreas,
    gasRichAreas,
    gasContentPoints,
    gasPressurePoints,
    softLayers,
    smallMineDamageAreas,
    goafAreas,
    abandonedShafts,
    poorSealedBoreholes,
    faultInfluenceZones,
    warningPoints,
    riskRanges,
    measurePoints,
    riskBodies,
  } = useGeoData();
  const {
    selectedRiskBody,
    effectiveSelectedRiskBodyId,
    clearSelectedRiskBody,
    handleSelectWarning,
    handleClearSelection,
    handleSelectRiskBody,
  } = useRiskSelection({
    riskBodies,
    selectedObject,
    setSelectedObject,
  });
  const {
    selectedWorkingFace,
    selectedWorkingFaceId,
    advanceDistance,
    handleWorkingFaceChange,
    handleAdvanceChange,
    handleSceneWorkingFaceSelect,
  } = useWorkingFaceSelection({
    workingFaces,
    selectedObject,
    setSelectedObject,
    onRiskSelectionClear: clearSelectedRiskBody,
  });

  useEffect(() => {
    loadLayerConfig();
  }, [loadLayerConfig]);

  const activeWarnings = useGeneratedWarnings({
    workingFaces,
    riskBodies,
    advanceDistance,
    selectedWorkingFaceId,
  });
  const handleSelectLegacyLayer = useLegacyLayerSelection({
    layerData,
    setSelectedLayerId,
    setSelectedObject,
    clearSelectedRiskBody,
  });

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
        selectedWorkingFaceId={selectedWorkingFace?.id || selectedWorkingFaceId}
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
      {selectedRiskBody && (
        <RiskBodyDetailPanel
          riskBody={selectedRiskBody}
          workingFace={selectedWorkingFace}
          warnings={activeWarnings}
          advanceDistance={advanceDistance}
          onClose={handleClearSelection}
        />
      )}
      {selectedObject?.type &&
        selectedObject.type !== "working_face" &&
        !selectedRiskBody && (
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
