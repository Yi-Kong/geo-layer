import * as THREE from "three";
import { useState } from "react";
import { Edges, Html, useCursor } from "@react-three/drei";
import { useSceneStore } from "../../store/sceneStore";

const DEFAULT_SIZE = {
  width: 520,
  depth: 236,
};

export default function CoalSeam({ seam, opacity = 0.72 }) {
  const [hovered, setHovered] = useState(false);
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const setSelectedObject = useSceneStore((state) => state.setSelectedObject);
  const selected = selectedObject?.id === seam.id;
  const height = Math.max(1.5, Math.abs(seam.topElevation - seam.bottomElevation));
  const centerY = (seam.topElevation + seam.bottomElevation) / 2;

  useCursor(hovered);

  return (
    <group>
      <mesh
        position={[0, centerY, 0]}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedObject(seam);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[DEFAULT_SIZE.width, height, DEFAULT_SIZE.depth]} />
        <meshStandardMaterial
          color={selected ? "#171717" : "#0f172a"}
          transparent
          opacity={selected ? 0.88 : opacity}
          roughness={0.72}
          metalness={0.04}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
        <Edges color={selected ? "#fbbf24" : "#334155"} threshold={15} />
      </mesh>

      <Html
        position={[DEFAULT_SIZE.width / 2 + 18, centerY, -DEFAULT_SIZE.depth / 2]}
        center
        distanceFactor={420}
      >
        <div className="pointer-events-none whitespace-nowrap bg-neutral-950/70 px-2 py-1 text-[11px] text-amber-100">
          {seam.name}
        </div>
      </Html>
    </group>
  );
}
