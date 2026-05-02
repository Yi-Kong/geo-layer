import * as THREE from "three";
import { useMemo, useState } from "react";
import { Html, useCursor } from "@react-three/drei";
import { useSceneStore } from "../../store/sceneStore";
import { getCenter, moveBoundary } from "../../utils/distance";

const DEFAULT_FACE_COLOR = "#0ea5e9";
const SELECTED_FACE_COLOR = "#67e8f9";

const RISK_COLORS = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#facc15",
  low: "#22c55e",
  default: DEFAULT_FACE_COLOR,
};

const STAGE_COLORS = {
  active: "#0ea5e9",
  mining: "#0ea5e9",
  planned: "#8b5cf6",
  paused: "#94a3b8",
  completed: "#22c55e",
  default: DEFAULT_FACE_COLOR,
};

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampPercent(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

function getAdvancePercent(current, planned) {
  const currentValue = toFiniteNumber(current);
  const plannedValue = toFiniteNumber(planned);

  if (!plannedValue || plannedValue <= 0) {
    return 0;
  }

  return clampPercent(Math.round((currentValue / plannedValue) * 100));
}

function getDisplayAdvancePercent(face, current, planned) {
  if (planned > 0) {
    return getAdvancePercent(current, planned);
  }

  return clampPercent(toFiniteNumber(face.metrics?.advancePercent));
}

function getStageLabel(face) {
  if (face.stageLabel) {
    return face.stageLabel;
  }

  switch (face.stage || face.status) {
    case "active":
    case "mining":
      return "正在回采";
    case "planned":
      return "计划准备";
    case "paused":
      return "暂停推进";
    case "completed":
      return "已完成";
    default:
      return "状态未明";
  }
}

function getRiskLabel(level) {
  switch (level) {
    case "critical":
      return "严重风险";
    case "high":
      return "高风险";
    case "medium":
      return "中风险";
    case "low":
      return "低风险";
    default:
      return "未评级";
  }
}

function getRiskColor(level) {
  return RISK_COLORS[level] || RISK_COLORS.default;
}

function getStageColor(face) {
  return STAGE_COLORS[face.stage || face.status] || STAGE_COLORS.default;
}

function mixColor(color, target, amount) {
  return `#${new THREE.Color(color)
    .lerp(new THREE.Color(target), amount)
    .getHexString()}`;
}

function getWorkingFaceColor(face, selected, hovered) {
  if (selected) {
    return SELECTED_FACE_COLOR;
  }

  const color = face.riskLevel ? getRiskColor(face.riskLevel) : getStageColor(face);

  if (hovered) {
    return mixColor(color, "#ffffff", 0.18);
  }

  return color;
}

function getArrowColor(face, selected) {
  if (selected) {
    return "#f8fafc";
  }

  switch (face.riskLevel) {
    case "critical":
      return "#ef4444";
    case "high":
      return "#fb923c";
    case "medium":
      return "#fde047";
    case "low":
      return "#4ade80";
    default:
      return "#22d3ee";
  }
}

function getOutlineColor(face, selected, hovered) {
  if (selected) {
    return "#f8fafc";
  }

  const color = face.riskLevel ? getRiskColor(face.riskLevel) : "#7dd3fc";

  if (hovered) {
    return mixColor(color, "#ffffff", 0.34);
  }

  return color;
}

function getMainRiskText(face) {
  const mainRisks = face.riskSummary?.mainRisks;

  if (Array.isArray(mainRisks) && mainRisks.length > 0) {
    return mainRisks.join("、");
  }

  if (typeof mainRisks === "string" && mainRisks.trim()) {
    return mainRisks;
  }

  if (face.properties?.当前风险) {
    return face.properties.当前风险;
  }

  return "暂无";
}

function getPlannedAdvance(face) {
  return toFiniteNumber(face.plannedAdvance ?? face.metrics?.plannedAdvance);
}

function formatDistance(value) {
  const number = toFiniteNumber(value);

  if (Number.isInteger(number)) {
    return String(number);
  }

  return number.toFixed(1).replace(/\.0$/, "");
}

function createFaceGeometry(boundary) {
  const positions = [
    ...boundary[0],
    ...boundary[1],
    ...boundary[2],
    ...boundary[0],
    ...boundary[2],
    ...boundary[3],
  ];
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.computeVertexNormals();

  return geometry;
}

function createOutlineGeometry(boundary) {
  const positions = [];

  for (let index = 0; index < boundary.length; index += 1) {
    positions.push(...boundary[index]);
    positions.push(...boundary[(index + 1) % boundary.length]);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  return geometry;
}

export default function WorkingFace({ face, advanceDistance, opacity = 0.72 }) {
  const [hovered, setHovered] = useState(false);
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const setSelectedObject = useSceneStore((state) => state.setSelectedObject);
  const currentAdvance = toFiniteNumber(advanceDistance);
  const plannedAdvance = getPlannedAdvance(face);
  const advancePercent = getDisplayAdvancePercent(
    face,
    currentAdvance,
    plannedAdvance
  );
  const stageLabel = getStageLabel(face);
  const riskLabel = getRiskLabel(face.riskLevel);
  const mainRiskText = getMainRiskText(face);
  const movedBoundary = useMemo(
    () => moveBoundary(face.boundary, face.advanceDirection, currentAdvance),
    [face.advanceDirection, face.boundary, currentAdvance]
  );
  const geometry = useMemo(
    () => createFaceGeometry(movedBoundary),
    [movedBoundary]
  );
  const outlineGeometry = useMemo(
    () => createOutlineGeometry(movedBoundary),
    [movedBoundary]
  );
  const center = useMemo(() => getCenter(movedBoundary), [movedBoundary]);
  const direction = useMemo(
    () => new THREE.Vector3(...face.advanceDirection).normalize(),
    [face.advanceDirection]
  );
  const arrowOrigin = useMemo(
    () => new THREE.Vector3(center[0], center[1] + 12, center[2]),
    [center]
  );
  const selected = selectedObject?.id === face.id;
  const faceColor = useMemo(
    () => getWorkingFaceColor(face, selected, hovered),
    [face, selected, hovered]
  );
  const outlineColor = useMemo(
    () => getOutlineColor(face, selected, hovered),
    [face, selected, hovered]
  );
  const arrowColor = useMemo(
    () => getArrowColor(face, selected),
    [face, selected]
  );
  const labelBorderColor = selected ? SELECTED_FACE_COLOR : getRiskColor(face.riskLevel);
  const materialOpacity = selected
    ? 0.94
    : hovered
      ? Math.min(0.9, opacity + 0.1)
      : opacity;

  useCursor(hovered);

  return (
    <group>
      <mesh
        geometry={geometry}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedObject({
            ...face,
            boundary: movedBoundary,
            currentAdvance,
            advancePercent,
            displayStatus: stageLabel,
            displayRiskLevel: riskLabel,
            metrics: {
              ...(face.metrics || {}),
              currentAdvance,
              advancePercent,
            },
          });
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={faceColor}
          emissive={selected || hovered ? faceColor : "#020617"}
          emissiveIntensity={selected ? 0.48 : hovered ? 0.22 : 0.06}
          transparent
          opacity={materialOpacity}
          roughness={0.46}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      <lineSegments geometry={outlineGeometry} renderOrder={2}>
        <lineBasicMaterial
          color={outlineColor}
          transparent
          opacity={selected ? 1 : hovered ? 0.95 : 0.78}
          depthTest={!selected && !hovered}
        />
      </lineSegments>

      {selected && (
        <lineSegments geometry={outlineGeometry} renderOrder={3}>
          <lineBasicMaterial
            color={SELECTED_FACE_COLOR}
            transparent
            opacity={0.72}
            depthTest={false}
          />
        </lineSegments>
      )}

      <arrowHelper args={[direction, arrowOrigin, 68, arrowColor, 18, 8]} />

      <Html position={[center[0], center[1] + 22, center[2]]} center distanceFactor={480}>
        <div
          className="pointer-events-none w-[168px] border bg-slate-950/86 px-2.5 py-1.5 text-[11px] leading-snug text-slate-100 shadow-[0_10px_24px_rgba(0,0,0,0.34)] backdrop-blur-sm"
          style={{
            borderColor: labelBorderColor,
            boxShadow: selected
              ? `0 0 18px ${SELECTED_FACE_COLOR}66`
              : hovered
                ? `0 0 14px ${labelBorderColor}55`
                : undefined,
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-semibold text-cyan-50">{face.name}</span>
            {selected && (
              <span className="shrink-0 text-[10px] font-semibold text-cyan-200">
                当前选中
              </span>
            )}
          </div>
          <div className="mt-0.5 text-[10px]" style={{ color: labelBorderColor }}>
            {stageLabel} / {riskLabel}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-200">
            推进 {formatDistance(currentAdvance)} m / {advancePercent}%
          </div>
          <div className="mt-0.5 truncate text-[10px] text-slate-300">
            主要风险：{mainRiskText}
          </div>
        </div>
      </Html>
    </group>
  );
}
