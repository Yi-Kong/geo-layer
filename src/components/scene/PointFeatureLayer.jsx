import { useRef, useState } from "react";
import { Html, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useSelectionStore } from "../../store/selectionStore";
import { getRiskLevelLabel } from "../../utils/riskLevel";

function PointFeature({ item, color, opacity, radius, animated, index }) {
  const meshRef = useRef(null);
  const elapsedRef = useRef(0);
  const [hovered, setHovered] = useState(false);
  const selectedObject = useSelectionStore((state) => state.selectedObject);
  const selectObject = useSelectionStore((state) => state.selectObject);
  const selected = selectedObject?.id === item.id;
  const itemColor = item.color || color;
  const pointRadius = radius || item.size?.[0] || 8;

  useCursor(hovered);

  useFrame((_, delta) => {
    if (!meshRef.current || !animated) {
      return;
    }

    elapsedRef.current += delta;
    const pulse = 1 + Math.sin(elapsedRef.current * 4 + index * 0.7) * 0.16;
    meshRef.current.scale.setScalar(selected ? pulse * 1.25 : pulse);
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={item.position}
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
        <sphereGeometry args={[pointRadius, 18, 18]} />
        <meshStandardMaterial
          color={selected ? "#ffffff" : itemColor}
          emissive={itemColor}
          emissiveIntensity={selected || animated ? 0.42 : 0.12}
          transparent
          opacity={selected ? 1 : opacity}
          roughness={0.38}
          metalness={0.02}
        />
      </mesh>

      {animated && (
        <mesh position={item.position} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[pointRadius * 1.25, pointRadius * 1.75, 32]} />
          <meshBasicMaterial color={itemColor} transparent opacity={0.35} />
        </mesh>
      )}

      {(hovered || selected) && (
        <Html
          position={[
            item.position[0],
            item.position[1] + pointRadius + 16,
            item.position[2],
          ]}
          center
          distanceFactor={480}
        >
          <div className="pointer-events-none min-w-[132px] border border-white/15 bg-slate-950/85 px-2 py-1.5 text-[11px] leading-[1.45] text-slate-100 shadow-[0_10px_22px_rgba(0,0,0,0.28)]">
            <div className="font-semibold">{item.name}</div>
            {item.riskLevel && (
              <div className="text-slate-300">
                {getRiskLevelLabel(item.riskLevel)}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function PointFeatureLayer({
  items = [],
  color = "#E63946",
  opacity = 0.95,
  radius = 8,
  animated = false,
}) {
  return (
    <>
      {items.map((item, index) => (
        <PointFeature
          key={item.id}
          item={item}
          color={color}
          opacity={opacity}
          radius={radius}
          animated={animated}
          index={index}
        />
      ))}
    </>
  );
}
