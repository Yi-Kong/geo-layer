import * as THREE from "three";
import { useMemo, useState } from "react";
import { Edges, Html, useCursor } from "@react-three/drei";
import { useSceneStore } from "../../store/sceneStore";
import { getRiskLevelLabel } from "../../utils/riskLevel";

function getBounds(points) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  points.forEach((point) => {
    point.forEach((value, index) => {
      min[index] = Math.min(min[index], value);
      max[index] = Math.max(max[index], value);
    });
  });

  return { min, max };
}

function getBox(points) {
  const bounds = getBounds(points);

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

export default function RiskBody({ body, color, opacity = 0.45 }) {
  const [hovered, setHovered] = useState(false);
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const setSelectedObject = useSceneStore((state) => state.setSelectedObject);
  const selected = selectedObject?.id === body.id;
  const box = useMemo(() => getBox(body.points), [body.points]);

  useCursor(hovered);

  return (
    <group>
      <mesh
        position={box.center}
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
          color={color}
          transparent
          opacity={selected ? Math.min(0.78, opacity + 0.22) : opacity}
          roughness={0.64}
          metalness={0.02}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
        <Edges color={selected ? "#ffffff" : color} threshold={15} />
      </mesh>

      {(hovered || selected) && (
        <Html
          position={[
            box.center[0],
            box.center[1] + box.size[1] / 2 + 18,
            box.center[2],
          ]}
          center
          distanceFactor={480}
        >
          <div className="pointer-events-none min-w-[132px] border border-white/15 bg-slate-950/85 px-2 py-1.5 text-[11px] leading-[1.45] text-slate-100 shadow-[0_10px_22px_rgba(0,0,0,0.28)]">
            <div className="font-semibold">{body.name}</div>
            <div className="text-slate-300">{getRiskLevelLabel(body.riskLevel)}</div>
          </div>
        </Html>
      )}
    </group>
  );
}
