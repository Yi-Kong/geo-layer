import * as THREE from "three";
import { useMemo, useState } from "react";
import { Html, useCursor } from "@react-three/drei";
import { useSelectionStore } from "../../store/selectionStore";

function getCenter(points) {
  const total = points.reduce(
    (sum, point) => [sum[0] + point[0], sum[1] + point[1], sum[2] + point[2]],
    [0, 0, 0]
  );

  return total.map((value) => value / points.length);
}

function PathFeature({ item, color, opacity, radius, showArrow }) {
  const [hovered, setHovered] = useState(false);
  const selectedObject = useSelectionStore((state) => state.selectedObject);
  const selectObject = useSelectionStore((state) => state.selectObject);
  const selected = selectedObject?.id === item.id;
  const points = useMemo(() => item.path || [], [item.path]);
  const itemColor = item.color || color;

  useCursor(hovered);

  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((point) => new THREE.Vector3(...point))
    );

    return new THREE.TubeGeometry(curve, 48, radius, 10, false);
  }, [points, radius]);

  const center = useMemo(() => getCenter(points), [points]);
  const arrow = useMemo(() => {
    if (!showArrow || points.length < 2) {
      return null;
    }

    const end = new THREE.Vector3(...points[points.length - 1]);
    const previous = new THREE.Vector3(...points[points.length - 2]);
    const direction = end.clone().sub(previous).normalize();

    return { end, direction };
  }, [points, showArrow]);

  return (
    <group>
      <mesh
        geometry={geometry}
        onClick={(event) => {
          event.stopPropagation();
          selectObject(item);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={selected ? "#ffffff" : itemColor}
          emissive={itemColor}
          emissiveIntensity={selected ? 0.18 : 0.04}
          transparent
          opacity={selected ? 1 : opacity}
          roughness={0.58}
          metalness={0.05}
        />
      </mesh>

      {arrow && (
        <arrowHelper
          args={[arrow.direction, arrow.end, 36, itemColor, 12, 6]}
        />
      )}

      {(hovered || selected) && (
        <Html
          position={[center[0], center[1] + 18, center[2]]}
          center
          distanceFactor={520}
        >
          <div className="pointer-events-none border border-white/15 bg-slate-950/85 px-2 py-1 text-[11px] text-slate-100">
            {item.name}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function PathFeatureLayer({
  items = [],
  color = "#94A3B8",
  opacity = 0.86,
  radius = 3,
  showArrow = false,
}) {
  return (
    <>
      {items.map((item) => (
        <PathFeature
          key={item.id}
          item={item}
          color={color}
          opacity={opacity}
          radius={radius}
          showArrow={showArrow}
        />
      ))}
    </>
  );
}
