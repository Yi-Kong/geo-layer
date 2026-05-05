import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
} from "@react-three/drei";
import GeoLayerModel from "./GeoLayerModel";
import BoreholeLayer from "../geology/BoreholeLayer";
import CoalSeamLayer from "../geology/CoalSeamLayer";
import CollapseColumnLayer from "../geology/CollapseColumnLayer";
import FaultLayer from "../geology/FaultLayer";
import HiddenHazardLayer from "../geology/HiddenHazardLayer";
import StrataLayer from "../geology/StrataLayer";
import AquiferLayer from "../hydrology/AquiferLayer";
import GoafWaterLayer from "../hydrology/GoafWaterLayer";
import WaterInrushPointLayer from "../hydrology/WaterInrushPointLayer";
import WaterRichLayer from "../hydrology/WaterRichLayer";
import DistanceLine from "../mining/DistanceLine";
import MiningPathLayer from "../mining/MiningPathLayer";
import TunnelLayer from "../mining/TunnelLayer";
import WorkingFaceLayer from "../mining/WorkingFaceLayer";
import GasMeasurePointLayer from "../gas/GasMeasurePointLayer";
import GasRichLayer from "../gas/GasRichLayer";
import SoftLayer from "../gas/SoftLayer";
import MeasurePointLayer from "../warning/MeasurePointLayer";
import RiskRangeLayer from "../warning/RiskRangeLayer";
import WarningPointLayer from "../warning/WarningPointLayer";
import { useLayerStore } from "../../store/layerStore";
import { useSelectionStore } from "../../store/selectionStore";
import { moveBoundary } from "../../utils/distance";
import {
  DEFAULT_HIGHLIGHT_COLOR,
  clamp,
  getBodyCenter,
  getDefaultWorkingFaceId,
  getHighlightRadius,
  getRiskBodyWarning,
  getRiskColor,
  getRiskLevel,
  getWarningKey,
  getWarningLevel,
  isRiskBodyLayerVisible,
  shouldShowWarningDistanceLine,
} from "../../utils/riskSceneUtils";
import RiskHighlightOverlay from "./overlays/RiskHighlightOverlay";

const DISABLE_RAYCAST = () => null;

function buildMovedWorkingFace(workingFace, advanceDistance) {
  if (!workingFace) {
    return null;
  }

  const canMove =
    Array.isArray(workingFace.boundary) &&
    workingFace.boundary.length > 0 &&
    Array.isArray(workingFace.advanceDirection);

  return {
    ...workingFace,
    boundary: canMove
      ? moveBoundary(
          workingFace.boundary,
          workingFace.advanceDirection,
          advanceDistance
        )
      : workingFace.boundary,
  };
}

function WarningMarker({ body, color = DEFAULT_HIGHLIGHT_COLOR }) {
  const center = getBodyCenter(body);
  const radius = clamp(getHighlightRadius(body) * 0.32, 6, 12);
  const markerOffset = radius + 16;

  return (
    <group position={[center[0], center[1] + markerOffset, center[2]]}>
      <mesh raycast={DISABLE_RAYCAST}>
        <sphereGeometry args={[radius, 18, 18]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.92}
          depthWrite={false}
        />
      </mesh>
      <mesh raycast={DISABLE_RAYCAST} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.24, radius * 1.74, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh
        raycast={DISABLE_RAYCAST}
        position={[0, -markerOffset * 0.45, 0]}
      >
        <cylinderGeometry args={[0.9, 0.9, markerOffset * 0.72, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.46}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

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
  const distanceLineWarningKeys = new Set();
  const hasFocusedRiskBody = Boolean(activeHighlightedRiskBodyId);
  let distanceLineCount = 0;

  generatedWarnings.forEach((warning, index) => {
    if (
      !shouldShowWarningDistanceLine(warning, activeHighlightedRiskBodyId) ||
      (!hasFocusedRiskBody && distanceLineCount >= 3)
    ) {
      return;
    }

    distanceLineWarningKeys.add(getWarningKey(warning, index));
    distanceLineCount += 1;
  });

  return (
    <Canvas
      camera={{ position: [430, 245, 430], fov: 42, near: 1, far: 1600 }}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => {
        clearSelection();
        onClearSelection?.();
      }}
    >
      <color attach="background" args={["#050910"]} />
      <fog attach="fog" args={["#050910", 560, 1220]} />

      <ambientLight intensity={0.74} />
      <directionalLight position={[280, 420, 220]} intensity={2.2} />
      <directionalLight position={[-280, 160, -220]} intensity={0.9} />
      <pointLight position={[0, 120, 0]} intensity={0.62} color="#38bdf8" />

      <gridHelper
        args={[760, 24, "#1e8fa6", "#152737"]}
        position={[0, -162, 0]}
      />

      <group rotation={[0, -0.24, 0]}>
        {layers.strata && (
          <>
            {strata.map((layer) => (
              <StrataLayer
                key={layer.id}
                layer={layer}
                opacity={opacities.strata}
              />
            ))}

            {layerData.length > 0 && (
              <group position={[0, 112, 0]} scale={[42, 32, 42]}>
                <GeoLayerModel
                  layerData={layerData}
                  visibleLayerIds={visibleLayerIds}
                  explode={explode}
                  selectedLayerId={selectedLayerId}
                  onSelectLayer={onSelectLayer}
                  opacity={opacities.strata}
                />
              </group>
            )}
          </>
        )}

        {layers.coalSeams && (
          <CoalSeamLayer items={coalSeams} opacity={opacities.coalSeams} />
        )}

        {layers.boreholes && (
          <BoreholeLayer items={boreholes} opacity={opacities.boreholes} />
        )}

        {layers.faults && (
          <FaultLayer items={faults} opacity={opacities.faults} />
        )}

        {layers.collapseColumns && (
          <CollapseColumnLayer
            items={collapseColumns}
            opacity={opacities.collapseColumns}
          />
        )}

        {layers.aquifers && (
          <AquiferLayer items={aquifers} opacity={opacities.aquifers} />
        )}

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

        {layers.goafWaterAreas && (
          <GoafWaterLayer
            items={goafWaterAreas}
            opacity={opacities.goafWaterAreas}
          />
        )}

        {layers.waterRichAreas && (
          <WaterRichLayer
            items={waterRichAreas}
            opacity={opacities.waterRichAreas}
          />
        )}

        {layers.waterInrushPoints && (
          <WaterInrushPointLayer
            items={waterInrushPoints}
            opacity={opacities.waterInrushPoints}
          />
        )}

        {layers.gasRichAreas && (
          <GasRichLayer items={gasRichAreas} opacity={opacities.gasRichAreas} />
        )}

        {(layers.gasContentPoints || layers.gasPressurePoints) && (
          <GasMeasurePointLayer
            contentPoints={layers.gasContentPoints ? gasContentPoints : []}
            pressurePoints={layers.gasPressurePoints ? gasPressurePoints : []}
            contentOpacity={opacities.gasContentPoints}
            pressureOpacity={opacities.gasPressurePoints}
          />
        )}

        {layers.softLayers && (
          <SoftLayer items={softLayers} opacity={opacities.softLayers} />
        )}

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

        {layers.warnings &&
          generatedWarnings.map((warning, index) => {
            const workingFace = workingFaces.find(
              (face) => face.id === warning.workingFaceId
            );
            const riskBody = sceneRiskBodies.find(
              (body) => body.id === warning.riskBodyId
            );
            const warningKey = getWarningKey(warning, index);

            if (!workingFace || !riskBody) {
              return null;
            }

            const warningColor = getRiskColor(riskBody, warning);
            const showDistanceLine = distanceLineWarningKeys.has(warningKey);
            const workingFaceAdvanceDistance =
              workingFace.id === advancingWorkingFaceId
                ? advanceDistance
                : workingFace.currentAdvance;
            const movedWorkingFace = buildMovedWorkingFace(
              workingFace,
              workingFaceAdvanceDistance
            );

            return (
              <group key={warningKey}>
                <WarningMarker body={riskBody} color={warningColor} />
                {showDistanceLine && movedWorkingFace && (
                  <DistanceLine
                    from={movedWorkingFace}
                    to={riskBody}
                    color={warningColor}
                    distance={warning.distance}
                  />
                )}
              </group>
            );
          })}

        {highlightedRiskBody && (
          <RiskHighlightOverlay
            riskBody={highlightedRiskBody}
            color={highlightColor}
            level={highlightedLevel}
            showInfluenceRange
          />
        )}
      </group>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        target={[20, -28, -16]}
        minDistance={130}
        maxDistance={920}
      />

      <GizmoHelper alignment="bottom-left" margin={[70, 70]}>
        <GizmoViewport
          axisColors={["#e8593f", "#4caf50", "#3f51e8"]}
          labelColor="white"
        />
      </GizmoHelper>
    </Canvas>
  );
}
