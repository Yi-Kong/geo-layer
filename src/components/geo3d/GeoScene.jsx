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

function getBodyCenter(body) {
  if (!body) {
    return [0, 0, 0];
  }

  if (Array.isArray(body.position)) {
    return body.position;
  }

  if (!Array.isArray(body.points) || body.points.length === 0) {
    return [0, 0, 0];
  }

  const total = body.points.reduce(
    (sum, point) => [sum[0] + point[0], sum[1] + point[1], sum[2] + point[2]],
    [0, 0, 0]
  );

  return total.map((value) => value / body.points.length);
}

function getHighlightRadius(body) {
  if (!Array.isArray(body?.size)) {
    return 14;
  }

  const maxSize = Math.max(
    ...body.size.map((value) => (Number.isFinite(Number(value)) ? Number(value) : 0))
  );

  return Math.max(14, Math.min(34, maxSize * 0.22));
}

function WarningMarker({ body, color }) {
  const center = getBodyCenter(body);

  return (
    <mesh position={[center[0], center[1] + 10, center[2]]}>
      <sphereGeometry args={[8, 18, 18]} />
      <meshBasicMaterial color={color} transparent opacity={0.92} />
    </mesh>
  );
}

function RiskBodyHighlight({ body, color = "#facc15" }) {
  const center = getBodyCenter(body);
  const radius = getHighlightRadius(body);

  return (
    <group position={[center[0], center[1] + radius * 0.45 + 12, center[2]]}>
      <mesh>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.28} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.15, radius * 1.45, 40]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
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
  selectedRiskBodyId,
  highlightedRiskBodyId,
  onClearSelection,
}) {
  const layers = useLayerStore((state) => state.layers);
  const opacities = useLayerStore((state) => state.opacities);
  const clearSelection = useSelectionStore((state) => state.clearSelection);
  const sceneRiskBodies =
    riskBodies.length > 0
      ? riskBodies
      : [...goafWaterAreas, ...waterRichAreas, ...gasRichAreas];
  const activeHighlightedRiskBodyId = highlightedRiskBodyId || selectedRiskBodyId;
  const highlightedRiskBody = sceneRiskBodies.find(
    (body) => body.id === activeHighlightedRiskBodyId
  );
  const highlightedWarning = generatedWarnings.find(
    (warning) => warning.riskBodyId === activeHighlightedRiskBodyId
  );

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
            opacity={opacities.workingFaces}
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
          generatedWarnings.map((warning) => {
            const workingFace = workingFaces.find(
              (face) => face.id === warning.workingFaceId
            );
            const riskBody = sceneRiskBodies.find(
              (body) => body.id === warning.riskBodyId
            );

            if (!workingFace || !riskBody) {
              return null;
            }

            return (
              <group key={warning.id}>
                <WarningMarker body={riskBody} color={warning.color} />
                <DistanceLine
                  from={{
                    ...workingFace,
                    boundary: moveBoundary(
                      workingFace.boundary,
                      workingFace.advanceDirection,
                      advanceDistance
                    ),
                  }}
                  to={riskBody}
                  color={warning.color}
                  distance={warning.distance}
                />
              </group>
            );
          })}

        {highlightedRiskBody && (
          <RiskBodyHighlight
            body={highlightedRiskBody}
            color={highlightedWarning?.color || "#facc15"}
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
