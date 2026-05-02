import * as THREE from "three";
import { useMemo } from "react";
import { Html } from "@react-three/drei";
import { calcEntityDistance, getCenter } from "../../utils/distance";

function toPoint3D(point) {
  if (!point) {
    return [0, 0, 0];
  }

  if (Array.isArray(point)) {
    return [
      Number.isFinite(Number(point[0])) ? Number(point[0]) : 0,
      Number.isFinite(Number(point[1])) ? Number(point[1]) : 0,
      Number.isFinite(Number(point[2])) ? Number(point[2]) : 0,
    ];
  }

  return [
    Number.isFinite(Number(point.x)) ? Number(point.x) : 0,
    Number.isFinite(Number(point.y)) ? Number(point.y) : 0,
    Number.isFinite(Number(point.z)) ? Number(point.z) : 0,
  ];
}

function getEntityCenter(entity) {
  if (entity?.position) {
    return toPoint3D(entity.position);
  }

  if (entity?.boundary) {
    return toPoint3D(getCenter(entity.boundary));
  }

  if (entity?.points) {
    return toPoint3D(getCenter(entity.points));
  }

  return [0, 0, 0];
}

function formatDistance(distance) {
  if (!Number.isFinite(distance)) {
    return "";
  }

  return distance >= 100
    ? `${Math.round(distance)} m`
    : `${distance.toFixed(1)} m`;
}

export default function DistanceLine({
  from,
  to,
  color = "#facc15",
  distance,
}) {
  const lineData = useMemo(() => {
    const fromCenter = getEntityCenter(from);
    const toCenter = getEntityCenter(to);
    const lineGeometry = new THREE.BufferGeometry();
    const computedDistance = Number.isFinite(distance)
      ? distance
      : from && to
        ? calcEntityDistance(from, to)
        : NaN;

    lineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([...fromCenter, ...toCenter], 3)
    );

    return {
      geometry: lineGeometry,
      label: formatDistance(computedDistance),
      midpoint: [
        (fromCenter[0] + toCenter[0]) / 2,
        (fromCenter[1] + toCenter[1]) / 2 + 8,
        (fromCenter[2] + toCenter[2]) / 2,
      ],
    };
  }, [distance, from, to]);

  return (
    <>
      <line geometry={lineData.geometry}>
        <lineBasicMaterial color={color} transparent opacity={0.95} />
      </line>

      {lineData.label && (
        <Html position={lineData.midpoint} center distanceFactor={520}>
          <div
            className="pointer-events-none whitespace-nowrap border bg-slate-950/84 px-2 py-1 text-[11px] font-semibold leading-none shadow-[0_8px_18px_rgba(0,0,0,0.35)]"
            style={{
              borderColor: color,
              color,
              textShadow: "0 1px 8px rgba(0,0,0,0.72)",
            }}
          >
            {lineData.label}
          </div>
        </Html>
      )}
    </>
  );
}
