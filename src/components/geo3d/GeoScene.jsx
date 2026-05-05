import { Canvas } from "@react-three/fiber";
import SceneEnvironment from "./SceneEnvironment";
import GasLayerGroup from "./layerGroups/GasLayerGroup";
import GeologyLayerGroup from "./layerGroups/GeologyLayerGroup";
import HydrologyLayerGroup from "./layerGroups/HydrologyLayerGroup";
import BoreholeLayer from "../geology/BoreholeLayer";
import HiddenHazardLayer from "../geology/HiddenHazardLayer";
import MiningPathLayer from "../mining/MiningPathLayer";
import TunnelLayer from "../mining/TunnelLayer";
import WorkingFaceLayer from "../mining/WorkingFaceLayer";
import MeasurePointLayer from "../warning/MeasurePointLayer";
import RiskRangeLayer from "../warning/RiskRangeLayer";
import WarningPointLayer from "../warning/WarningPointLayer";
import { useLayerStore } from "../../store/layerStore";
import { useSelectionStore } from "../../store/selectionStore";
import {
  getDefaultWorkingFaceId,
  getRiskBodyWarning,
  getRiskColor,
  getRiskLevel,
  getWarningLevel,
  isRiskBodyLayerVisible,
} from "../../utils/riskSceneUtils";
import RiskHighlightOverlay from "./overlays/RiskHighlightOverlay";
import WarningOverlay from "./overlays/WarningOverlay";

export default function GeoScene({
  layerData,
  visibleLayerIds,
  explode,
  selectedLayerId,
  onSelectLayer,
  strata = [],
  coalSeams = [],
  boreholes = [],
  faults = [],
  collapseColumns = [],
  aquifers = [],
  workingFaces = [],
  tunnels = [],
  miningPaths = [],
  goafWaterAreas = [],
  waterInrushPoints = [],
  waterRichAreas = [],
  gasRichAreas = [],
  gasContentPoints = [],
  gasPressurePoints = [],
  softLayers = [],
  smallMineDamageAreas = [],
  goafAreas = [],
  abandonedShafts = [],
  poorSealedBoreholes = [],
  faultInfluenceZones = [],
  warningPoints = [],
  riskRanges = [],
  measurePoints = [],
  generatedWarnings = [],
  riskBodies = [],
  advanceDistance = 0,
  selectedWorkingFaceId = "",
  selectedRiskBodyId,
  highlightedRiskBodyId,
  onClearSelection,
  onSelectWorkingFace,
}) {
  const layers = useLayerStore((state) => state.layers);
  const opacities = useLayerStore((state) => state.opacities);
  const clearSelection = useSelectionStore((state) => state.clearSelection);
  const sceneRiskBodies =
    riskBodies.length > 0
      ? riskBodies
      : [
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
  const activeHighlightedRiskBodyId =
    highlightedRiskBodyId ||
    selectedRiskBodyId ||
    generatedWarnings.find((warning) => getWarningLevel(warning) === "critical")
      ?.riskBodyId ||
    null;
  const highlightedRiskBodyCandidate = sceneRiskBodies.find(
    (body) => body.id === activeHighlightedRiskBodyId
  );
  const highlightedRiskBody =
    highlightedRiskBodyCandidate &&
    isRiskBodyLayerVisible(highlightedRiskBodyCandidate, layers)
      ? highlightedRiskBodyCandidate
      : null;
  const highlightedWarning = getRiskBodyWarning(
    activeHighlightedRiskBodyId,
    generatedWarnings
  );
  const highlightColor = getRiskColor(highlightedRiskBody, highlightedWarning);
  const highlightedLevel =
    getWarningLevel(highlightedWarning) !== "none"
      ? getWarningLevel(highlightedWarning)
      : getRiskLevel(highlightedRiskBody);
  const hasSelectedWorkingFace = workingFaces.some(
    (face) => face.id === selectedWorkingFaceId
  );
  const advancingWorkingFaceId = hasSelectedWorkingFace
    ? selectedWorkingFaceId
    : getDefaultWorkingFaceId(workingFaces);

  return (
    <Canvas
      camera={{ position: [430, 245, 430], fov: 42, near: 1, far: 1600 }}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => {
        clearSelection();
        onClearSelection?.();
      }}
    >
      <SceneEnvironment />

      <group rotation={[0, -0.24, 0]}>
        <GeologyLayerGroup
          layers={layers}
          opacities={opacities}
          strata={strata}
          coalSeams={coalSeams}
          boreholes={boreholes}
          faults={faults}
          collapseColumns={collapseColumns}
          layerData={layerData}
          visibleLayerIds={visibleLayerIds}
          explode={explode}
          selectedLayerId={selectedLayerId}
          onSelectLayer={onSelectLayer}
        />

        <HydrologyLayerGroup
          layers={layers}
          opacities={opacities}
          aquifers={aquifers}
          goafWaterAreas={goafWaterAreas}
          waterRichAreas={waterRichAreas}
          waterInrushPoints={waterInrushPoints}
        />

        {layers.tunnels && (
          <TunnelLayer items={tunnels} opacity={opacities.tunnels} />
        )}

        {layers.workingFaces && (
          <WorkingFaceLayer
            items={workingFaces}
            advanceDistance={advanceDistance}
            selectedWorkingFaceId={advancingWorkingFaceId}
            opacity={opacities.workingFaces}
            onSelectWorkingFace={onSelectWorkingFace}
          />
        )}

        {layers.miningPaths && (
          <MiningPathLayer items={miningPaths} opacity={opacities.miningPaths} />
        )}

        <GasLayerGroup
          layers={layers}
          opacities={opacities}
          gasRichAreas={gasRichAreas}
          gasContentPoints={gasContentPoints}
          gasPressurePoints={gasPressurePoints}
          softLayers={softLayers}
        />

        {layers.smallMineDamageAreas && (
          <HiddenHazardLayer
            items={smallMineDamageAreas}
            opacity={opacities.smallMineDamageAreas}
          />
        )}

        {layers.goafAreas && (
          <HiddenHazardLayer items={goafAreas} opacity={opacities.goafAreas} />
        )}

        {layers.abandonedShafts && (
          <BoreholeLayer
            items={abandonedShafts}
            opacity={opacities.abandonedShafts}
            color="#FDE68A"
            radius={5}
          />
        )}

        {layers.poorSealedBoreholes && (
          <BoreholeLayer
            items={poorSealedBoreholes}
            opacity={opacities.poorSealedBoreholes}
            color="#FBBF24"
            radius={4}
          />
        )}

        {layers.faultInfluenceZones && (
          <HiddenHazardLayer
            items={faultInfluenceZones}
            opacity={opacities.faultInfluenceZones}
          />
        )}

        {layers.riskRanges && (
          <RiskRangeLayer items={riskRanges} opacity={opacities.riskRanges} />
        )}

        {layers.measures && (
          <MeasurePointLayer items={measurePoints} opacity={opacities.measures} />
        )}

        {layers.warnings &&
          warningPoints.length > 0 && (
            <WarningPointLayer
              items={warningPoints}
              opacity={opacities.warnings}
            />
          )}

        <WarningOverlay
          visible={layers.warnings}
          generatedWarnings={generatedWarnings}
          workingFaces={workingFaces}
          riskBodies={sceneRiskBodies}
          advanceDistance={advanceDistance}
          advancingWorkingFaceId={advancingWorkingFaceId}
          focusedRiskBodyId={activeHighlightedRiskBodyId}
        />

        {highlightedRiskBody && (
          <RiskHighlightOverlay
            riskBody={highlightedRiskBody}
            color={highlightColor}
            level={highlightedLevel}
            showInfluenceRange
          />
        )}
      </group>
    </Canvas>
  );
}
