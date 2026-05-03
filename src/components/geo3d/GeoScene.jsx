import * as THREE from "three";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
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

const RISK_LEVEL_COLORS = {
  low: "#2A9D8F",
  medium: "#E9C46A",
  high: "#F4A261",
  critical: "#E63946",
};

const DEFAULT_HIGHLIGHT_COLOR = "#facc15";
const HIGH_PRIORITY_LEVELS = ["critical", "high"];
const DISABLE_RAYCAST = () => null;

const RISK_BODY_LAYER_BY_TYPE = {
  goaf_water: "goafWaterAreas",
  goaf_water_area: "goafWaterAreas",
  water_inrush: "waterRichAreas",
  water_rich_area: "waterRichAreas",
  gas: "gasRichAreas",
  gas_rich_area: "gasRichAreas",
  soft_layer: "softLayers",
  small_mine_damage: "smallMineDamageAreas",
  small_mine_damage_area: "smallMineDamageAreas",
  goaf: "goafAreas",
  goaf_area: "goafAreas",
  abandoned_shaft: "abandonedShafts",
  poor_sealed_borehole: "poorSealedBoreholes",
  fault_influence: "faultInfluenceZones",
  fault_influence_zone: "faultInfluenceZones",
};

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function getSafePoint(point) {
  if (!Array.isArray(point)) {
    return [0, 0, 0];
  }

  return [
    toFiniteNumber(point[0]),
    toFiniteNumber(point[1]),
    toFiniteNumber(point[2]),
  ];
}

function getBodyPointSource(body) {
  if (Array.isArray(body?.points) && body.points.length > 0) {
    return body.points;
  }

  if (Array.isArray(body?.boundary) && body.boundary.length > 0) {
    return body.boundary;
  }

  return [];
}

function getBodyCenter(body) {
  if (!body) {
    return [0, 0, 0];
  }

  if (Array.isArray(body.position) && body.position.length >= 3) {
    return getSafePoint(body.position);
  }

  const points = getBodyPointSource(body);

  if (points.length === 0) {
    return [0, 0, 0];
  }

  const total = points.reduce(
    (sum, point) => {
      const safePoint = getSafePoint(point);

      return [
        sum[0] + safePoint[0],
        sum[1] + safePoint[1],
        sum[2] + safePoint[2],
      ];
    },
    [0, 0, 0]
  );

  return total.map((value) => value / points.length);
}

function getBodySize(body) {
  if (Array.isArray(body?.size) && body.size.length > 0) {
    return [0, 1, 2].map((index) =>
      Math.max(1, Math.abs(toFiniteNumber(body.size[index], 1)))
    );
  }

  const points = getBodyPointSource(body);

  if (points.length > 0) {
    const bounds = points.reduce(
      (result, point) => {
        const safePoint = getSafePoint(point);

        safePoint.forEach((value, index) => {
          result.min[index] = Math.min(result.min[index], value);
          result.max[index] = Math.max(result.max[index], value);
        });

        return result;
      },
      {
        min: [Infinity, Infinity, Infinity],
        max: [-Infinity, -Infinity, -Infinity],
      }
    );

    return bounds.max.map((value, index) =>
      Math.max(1, value - bounds.min[index])
    );
  }

  return [1, 1, 1];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getInfluenceRadius(body) {
  const radius = toFiniteNumber(
    body?.influenceRadius ?? body?.influenceRange ?? body?.radius,
    NaN
  );

  if (Number.isFinite(radius) && radius > 0) {
    return clamp(radius, 18, 260);
  }

  const size = getBodySize(body);
  const maxSize = Math.max(...size);

  if (maxSize > 0) {
    return clamp(maxSize * 0.75, 18, 220);
  }

  return 34;
}

function getHighlightRadius(body) {
  const size = getBodySize(body);
  const maxSize = Math.max(...size);

  return clamp(maxSize * 0.22, 12, 46);
}

function getWarningLevel(warning) {
  return warning?.level || warning?.riskLevel || "none";
}

function getRiskLevel(body) {
  return body?.riskLevel || body?.level || "none";
}

function getRiskColor(body, warning) {
  const warningLevel = getWarningLevel(warning);
  const riskLevel = getRiskLevel(body);

  return (
    warning?.color ||
    body?.color ||
    RISK_LEVEL_COLORS[warningLevel] ||
    RISK_LEVEL_COLORS[riskLevel] ||
    DEFAULT_HIGHLIGHT_COLOR
  );
}

function getRiskBodyWarning(riskBodyId, generatedWarnings = []) {
  if (!riskBodyId) {
    return null;
  }

  return (
    generatedWarnings.find((warning) => warning.riskBodyId === riskBodyId) ||
    null
  );
}

function shouldShowWarningDistanceLine(warning, selectedRiskBodyId) {
  if (selectedRiskBodyId) {
    return warning.riskBodyId === selectedRiskBodyId;
  }

  return HIGH_PRIORITY_LEVELS.includes(getWarningLevel(warning));
}

function getWarningKey(warning, index) {
  return (
    warning?.id ||
    `${warning?.workingFaceId || "working-face"}-${warning?.riskBodyId || "risk-body"}-${index}`
  );
}

function getRiskBodyLayerId(body) {
  return (
    RISK_BODY_LAYER_BY_TYPE[body?.riskType] ||
    RISK_BODY_LAYER_BY_TYPE[body?.type] ||
    null
  );
}

function isRiskBodyLayerVisible(body, layers = {}) {
  const layerId = getRiskBodyLayerId(body);

  return !layerId || layers[layerId] !== false;
}

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

function InfluenceRange({ body, color = DEFAULT_HIGHLIGHT_COLOR }) {
  const center = getBodyCenter(body);
  const radius = getInfluenceRadius(body);

  if (!Number.isFinite(radius) || radius <= 0) {
    return null;
  }

  return (
    <group>
      <mesh raycast={DISABLE_RAYCAST} position={center}>
        <sphereGeometry args={[radius, 32, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh
        raycast={DISABLE_RAYCAST}
        position={[center[0], center[1] - 2, center[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[radius * 0.92, radius, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.36}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function PulseRing({ body, color = DEFAULT_HIGHLIGHT_COLOR }) {
  const ref = useRef(null);
  const elapsedRef = useRef(0);
  const center = getBodyCenter(body);
  const radius = getInfluenceRadius(body);

  useFrame((_, delta) => {
    if (!ref.current) {
      return;
    }

    elapsedRef.current += delta;

    const wave = Math.sin(elapsedRef.current * 2.4);
    const scale = 1 + wave * 0.06;
    const opacity = 0.26 + wave * 0.08;

    ref.current.scale.setScalar(scale);

    if (ref.current.material) {
      ref.current.material.opacity = opacity;
    }
  });

  if (!Number.isFinite(radius) || radius <= 0) {
    return null;
  }

  return (
    <mesh
      ref={ref}
      raycast={DISABLE_RAYCAST}
      position={[center[0], center[1] + 0.5, center[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[radius * 0.72, radius, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.26}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function RiskBodyHighlight({
  body,
  color = DEFAULT_HIGHLIGHT_COLOR,
  showInfluenceRange = true,
  pulse = false,
}) {
  const center = getBodyCenter(body);
  const size = getBodySize(body);
  const radius = getHighlightRadius(body);
  const ringRadius = clamp(getInfluenceRadius(body) * 0.18, radius * 1.2, 64);
  const markerY = center[1] + radius * 0.45 + 12;
  const ringY = center[1] - Math.min(size[1] * 0.5, 10);

  return (
    <group>
      {showInfluenceRange && <InfluenceRange body={body} color={color} />}
      <mesh raycast={DISABLE_RAYCAST} position={[center[0], markerY, center[2]]}>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.24}
          depthWrite={false}
        />
      </mesh>
      <mesh
        raycast={DISABLE_RAYCAST}
        position={[center[0], ringY, center[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[ringRadius * 0.82, ringRadius, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.72}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {pulse && <PulseRing body={body} color={color} />}
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
            const movedWorkingFace = buildMovedWorkingFace(
              workingFace,
              advanceDistance
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
          <RiskBodyHighlight
            body={highlightedRiskBody}
            color={highlightColor}
            showInfluenceRange
            pulse={highlightedLevel === "critical"}
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
