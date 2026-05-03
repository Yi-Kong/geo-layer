import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges, Html, useCursor } from "@react-three/drei";
import { useSceneStore } from "../../store/sceneStore";
import { getRiskLevelLabel } from "../../utils/riskLevel";

const DEFAULT_RISK_COLOR = "#94A3B8";

const RISK_LEVEL_COLORS = {
  low: "#2A9D8F",
  medium: "#E9C46A",
  high: "#F4A261",
  critical: "#E63946",
};

const RISK_LEVEL_LABELS = {
  low: "低风险",
  medium: "一般",
  high: "较大",
  critical: "严重",
};

const RISK_TYPE_LABELS = {
  goaf_water: "采空积水区 / 老空水",
  water_inrush: "富水区 / 突水危险区",
  gas: "瓦斯富集区",
  soft_layer: "软分层",
  small_mine_damage: "小窑破坏区",
  goaf: "采空区",
  abandoned_shaft: "废弃井筒",
  poor_sealed_borehole: "封闭不良钻孔",
  fault_influence: "断层影响带",
};

function getSafeNumber(value, fallback = 0) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function getSafeVector3(value, fallback = [0, 0, 0]) {
  return [0, 1, 2].map((index) =>
    getSafeNumber(value?.[index], fallback[index] ?? 0)
  );
}

function getSafeSize(value) {
  return getSafeVector3(value, [1, 1, 1]).map((item) =>
    Math.max(1, Math.abs(item))
  );
}

function getValidPoint(point) {
  if (!Array.isArray(point)) {
    return null;
  }

  const safePoint = getSafeVector3(point, [NaN, NaN, NaN]);

  return safePoint.every(Number.isFinite) ? safePoint : null;
}

function getBounds(points) {
  const validPoints = Array.isArray(points)
    ? points.map(getValidPoint).filter(Boolean)
    : [];

  if (validPoints.length === 0) {
    return null;
  }

  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  validPoints.forEach((point) => {
    point.forEach((value, index) => {
      min[index] = Math.min(min[index], value);
      max[index] = Math.max(max[index], value);
    });
  });

  return { min, max };
}

function getBox(points) {
  const bounds = getBounds(points);

  if (!bounds) {
    return {
      center: [0, 0, 0],
      size: [1, 1, 1],
    };
  }

  return {
    center: [
      (bounds.min[0] + bounds.max[0]) / 2,
      (bounds.min[1] + bounds.max[1]) / 2,
      (bounds.min[2] + bounds.max[2]) / 2,
    ],
    size: [
      Math.max(1, bounds.max[0] - bounds.min[0]),
      Math.max(1, bounds.max[1] - bounds.min[1]),
      Math.max(1, bounds.max[2] - bounds.min[2]),
    ],
  };
}

function getBodyBox(body = {}) {
  if (Array.isArray(body.points) && body.points.length > 0) {
    return getBox(body.points);
  }

  return {
    center: getSafeVector3(body.position, [0, 0, 0]),
    size: getSafeSize(body.size),
  };
}

function getRiskColor(body = {}, propColor) {
  const riskLevel = body.riskLevel || body.level;

  return (
    body.color ||
    propColor ||
    RISK_LEVEL_COLORS[riskLevel] ||
    DEFAULT_RISK_COLOR
  );
}

function getRiskLevelLabelText(body = {}) {
  const riskLevel = body.riskLevel || body.level;

  return (
    body.riskLevelLabel ||
    RISK_LEVEL_LABELS[riskLevel] ||
    getRiskLevelLabel(riskLevel) ||
    ""
  );
}

function getRiskTypeLabelText(body = {}) {
  const riskType = body.riskType || body.type;

  return body.riskTypeLabel || body.label || RISK_TYPE_LABELS[riskType] || "";
}

function getFileSectionText(body = {}) {
  const sectionParts = [body.fileSection, body.fileSectionName].filter(Boolean);

  return sectionParts.join(" ");
}

function getInfluenceRadiusValue(body = {}) {
  const radius = getSafeNumber(
    body.influenceRadius ?? body.radius ?? body.influenceRange,
    NaN
  );

  if (!Number.isFinite(radius) || radius <= 0) {
    return null;
  }

  return radius;
}

function getInfluenceRadius(body = {}) {
  const radius = getInfluenceRadiusValue(body);

  return radius ? Math.max(18, Math.min(radius, 260)) : null;
}

function getBaseRadius(size) {
  const [width, , depth] = getSafeSize(size);

  return Math.max(12, Math.min(160, Math.max(width, depth) * 0.62));
}

function InfluenceRange({ center, radius, color }) {
  if (!Number.isFinite(radius) || radius <= 0) {
    return null;
  }

  return (
    <group position={center}>
      <mesh>
        <sphereGeometry args={[radius, 36, 18]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.055}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.96, radius, 72]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.26}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function CriticalPulse({ center, size, color }) {
  const groupRef = useRef(null);
  const materialRef = useRef(null);
  const elapsedRef = useRef(0);
  const pulseSize = useMemo(
    () => getSafeSize(size).map((item) => item + 10),
    [size]
  );

  useFrame((_, delta) => {
    elapsedRef.current += delta;

    const wave = (Math.sin(elapsedRef.current * 2.4) + 1) / 2;
    const scale = 1.02 + wave * 0.06;

    if (groupRef.current) {
      groupRef.current.scale.setScalar(scale);
    }

    if (materialRef.current) {
      materialRef.current.opacity = 0.12 + wave * 0.22;
    }
  });

  return (
    <group ref={groupRef} position={center}>
      <mesh>
        <boxGeometry args={pulseSize} />
        <meshBasicMaterial
          ref={materialRef}
          color={color}
          transparent
          opacity={0.16}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function RiskBaseRing({ center, size, color, visible, selected }) {
  if (!visible) {
    return null;
  }

  const radius = getBaseRadius(size);
  const baseY = center[1] - size[1] / 2 + 0.4;

  return (
    <group position={[center[0], baseY, center[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.78, radius, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={selected ? 0.58 : 0.32}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.04, radius * 1.08, 64]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={selected ? 0.34 : 0.16}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function RiskBodyLabel({ body, center, size, color, levelColor, visible }) {
  if (!visible) {
    return null;
  }

  const riskName = body.name || body.code || body.id || "未命名风险体";
  const typeLabel = getRiskTypeLabelText(body);
  const levelLabel = getRiskLevelLabelText(body);
  const fileSectionText = getFileSectionText(body);
  const influenceRadiusValue = getInfluenceRadiusValue(body);
  const subtitle = [typeLabel, levelLabel].filter(Boolean).join(" · ");

  return (
    <Html
      position={[center[0], center[1] + size[1] / 2 + 18, center[2]]}
      center
      distanceFactor={480}
    >
      <div
        className="pointer-events-none min-w-[168px] max-w-[230px] border border-white/15 bg-slate-950/88 px-2.5 py-2 text-[11px] leading-[1.45] text-slate-100 shadow-[0_10px_22px_rgba(0,0,0,0.28)] backdrop-blur-sm"
        style={{ borderColor: levelColor, boxShadow: `0 0 18px ${color}` }}
      >
        <div className="truncate text-[12px] font-semibold">{riskName}</div>
        {subtitle && (
          <div className="mt-0.5 text-slate-300">
            {typeLabel}
            {typeLabel && levelLabel && <span className="text-slate-500"> · </span>}
            {levelLabel && (
              <span className="font-semibold" style={{ color: levelColor }}>
                {levelLabel}
              </span>
            )}
          </div>
        )}
        {fileSectionText && (
          <div className="mt-1 text-slate-400">文件章节：{fileSectionText}</div>
        )}
        {influenceRadiusValue && (
          <div className="text-slate-400">
            影响半径：{Math.round(influenceRadiusValue)} m
          </div>
        )}
      </div>
    </Html>
  );
}

export default function RiskBody({
  body = {},
  color,
  opacity = 0.45,
  showInfluenceRange = false,
}) {
  const [hovered, setHovered] = useState(false);
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const setSelectedObject = useSceneStore((state) => state.setSelectedObject);
  const selected = Boolean(body.id && selectedObject?.id === body.id);
  const box = useMemo(() => getBodyBox(body), [body]);
  const riskColor = getRiskColor(body, color);
  const riskLevel = body.riskLevel || body.level;
  const levelColor = RISK_LEVEL_COLORS[riskLevel] || riskColor;
  const critical = riskLevel === "critical";
  const influenceRadius = getInfluenceRadius(body);
  const safeOpacity = Math.max(0.05, Math.min(1, getSafeNumber(opacity, 0.45)));
  const selectedOpacity = Math.min(0.82, safeOpacity + 0.28);
  const activeOpacity = selected
    ? selectedOpacity
    : hovered
      ? Math.min(0.72, safeOpacity + 0.16)
      : safeOpacity;
  const showLabel = hovered || selected;
  const showRange =
    Boolean(influenceRadius) &&
    (selected || hovered || critical || showInfluenceRange);
  const showBaseRing = selected || hovered || critical;

  useCursor(hovered);

  return (
    <group>
      {showRange && (
        <InfluenceRange
          center={box.center}
          radius={influenceRadius}
          color={levelColor}
        />
      )}

      {critical && (
        <CriticalPulse center={box.center} size={box.size} color={levelColor} />
      )}

      <RiskBaseRing
        center={box.center}
        size={box.size}
        color={levelColor}
        visible={showBaseRing}
        selected={selected}
      />

      <mesh
        position={box.center}
        rotation={body.rotation || [0, 0, 0]}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedObject(body);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={box.size} />
        <meshStandardMaterial
          color={riskColor}
          emissive={hovered || selected ? levelColor : "#000000"}
          emissiveIntensity={selected ? 0.18 : hovered ? 0.1 : 0}
          transparent
          opacity={activeOpacity}
          roughness={0.58}
          metalness={0.02}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
        <Edges
          color={selected ? "#ffffff" : hovered || critical ? levelColor : riskColor}
          threshold={15}
        />
      </mesh>

      <RiskBodyLabel
        body={body}
        center={box.center}
        size={box.size}
        color={riskColor}
        levelColor={levelColor}
        visible={showLabel}
      />
    </group>
  );
}
