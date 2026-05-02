import { useState } from "react";
import { Html, useCursor } from "@react-three/drei";
import { useSelectionStore } from "../../store/selectionStore";

function Borehole({ item, opacity, color, radius }) {
  const [hovered, setHovered] = useState(false);
  const selectedObject = useSelectionStore((state) => state.selectedObject);
  const selectObject = useSelectionStore((state) => state.selectObject);
  const selected = selectedObject?.id === item.id;
  const height = item.size?.[1] || item.depth || 180;
  const topPosition = item.position || [0, height / 2, 0];
  const center = [topPosition[0], topPosition[1] - height / 2, topPosition[2]];
  const itemColor = item.color || color;

  useCursor(hovered);

  return (
    <group>
      <mesh
        position={center}
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
        <cylinderGeometry args={[radius, radius, height, 14]} />
        <meshStandardMaterial
          color={selected ? "#ffffff" : itemColor}
          emissive={itemColor}
          emissiveIntensity={selected ? 0.24 : 0.08}
          transparent
          opacity={selected ? 1 : opacity}
          roughness={0.42}
        />
      </mesh>

      <mesh position={topPosition}>
        <sphereGeometry args={[radius * 1.7, 14, 14]} />
        <meshStandardMaterial
          color={selected ? "#ffffff" : itemColor}
          emissive={itemColor}
          emissiveIntensity={0.22}
        />
      </mesh>

      {(hovered || selected) && (
        <Html
          position={[topPosition[0], topPosition[1] + 16, topPosition[2]]}
          center
          distanceFactor={500}
        >
          <div className="pointer-events-none whitespace-nowrap border border-yellow-300/30 bg-slate-950/85 px-2 py-1 text-[11px] text-yellow-100">
            {item.name}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function BoreholeLayer({
  items = [],
  opacity = 0.9,
  color = "#FACC15",
  radius = 3,
}) {
  return (
    <>
      {items.map((item) => (
        <Borehole
          key={item.id}
          item={item}
          opacity={opacity}
          color={color}
          radius={radius}
        />
      ))}
    </>
  );
}
