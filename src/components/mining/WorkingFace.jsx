import * as THREE from "three";
import { useMemo, useState } from "react";
import { Html, useCursor } from "@react-three/drei";
import { useSceneStore } from "../../store/sceneStore";
import { getCenter, moveBoundary } from "../../utils/distance";

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
  const movedBoundary = useMemo(
    () => moveBoundary(face.boundary, face.advanceDirection, advanceDistance),
    [face.advanceDirection, face.boundary, advanceDistance]
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
            currentAdvance: advanceDistance,
          });
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={selected ? "#38bdf8" : "#0ea5e9"}
          transparent
          opacity={selected ? 0.92 : opacity}
          roughness={0.46}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      <lineSegments geometry={outlineGeometry}>
        <lineBasicMaterial color={selected ? "#f8fafc" : "#7dd3fc"} />
      </lineSegments>

      <arrowHelper args={[direction, arrowOrigin, 68, 0x38bdf8, 18, 8]} />

      <Html position={[center[0], center[1] + 22, center[2]]} center distanceFactor={480}>
        <div className="pointer-events-none border border-cyan-300/30 bg-slate-950/80 px-2 py-1 text-[11px] leading-tight text-cyan-100">
          <div className="font-semibold">{face.name}</div>
          <div>推进 {advanceDistance} m</div>
        </div>
      </Html>
    </group>
  );
}
