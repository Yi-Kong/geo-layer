import * as THREE from "three";
import { useMemo, useState } from "react";
import { Edges, Html, useCursor } from "@react-three/drei";
import { useSceneStore } from "../../store/sceneStore";

const DEFAULT_SIZE = {
  width: 560,
  depth: 280,
};

export default function StrataLayer({ layer, opacity = 0.38 }) {
  const [hovered, setHovered] = useState(false);
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const setSelectedObject = useSceneStore((state) => state.setSelectedObject);
  const selected = selectedObject?.id === layer.id;
  const height = Math.abs(layer.topElevation - layer.bottomElevation);
  const centerY = (layer.topElevation + layer.bottomElevation) / 2;

  useCursor(hovered);

  const labelPosition = useMemo(
    () => [-DEFAULT_SIZE.width / 2 - 22, centerY, 0],
    [centerY]
  );

  return (
    <group>
      <mesh
        position={[0, centerY, 0]}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedObject(layer);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[DEFAULT_SIZE.width, height, DEFAULT_SIZE.depth]} />
        <meshStandardMaterial
          color={layer.color}
          transparent
          opacity={selected ? Math.min(0.62, opacity + 0.18) : opacity}
          roughness={0.88}
          metalness={0.02}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
        <Edges
          color={selected ? "#f8fafc" : "#94a3b8"}
          threshold={15}
        />
      </mesh>

      <Html position={labelPosition} center distanceFactor={420}>
        <div
          className={`pointer-events-none whitespace-nowrap border-l-2 px-2 py-1 text-[11px] leading-tight ${
            selected
              ? "border-cyan-300 bg-cyan-950/80 text-cyan-100"
              : "border-slate-500 bg-slate-950/60 text-slate-300"
          }`}
        >
          {layer.name}
        </div>
      </Html>
    </group>
  );
}
