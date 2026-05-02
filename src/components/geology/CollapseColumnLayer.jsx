import { useState } from "react";
import { Html, useCursor } from "@react-three/drei";
import { useSelectionStore } from "../../store/selectionStore";

function CollapseColumn({ item, opacity }) {
  const [hovered, setHovered] = useState(false);
  const selectedObject = useSelectionStore((state) => state.selectedObject);
  const selectObject = useSelectionStore((state) => state.selectObject);
  const selected = selectedObject?.id === item.id;
  const radius = item.size[0] / 2;
  const height = item.size[1];

  useCursor(hovered);

  return (
    <group>
      <mesh
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
        <cylinderGeometry args={[radius * 0.76, radius, height, 18]} />
        <meshStandardMaterial
          color={selected ? "#ffffff" : item.color}
          emissive={item.color}
          emissiveIntensity={selected ? 0.18 : 0.04}
          transparent
          opacity={selected ? Math.min(1, opacity + 0.2) : opacity}
          roughness={0.82}
          depthWrite={false}
        />
      </mesh>

      {(hovered || selected) && (
        <Html
          position={[item.position[0], item.position[1] + height / 2 + 14, item.position[2]]}
          center
          distanceFactor={520}
        >
          <div className="pointer-events-none border border-purple-300/30 bg-slate-950/85 px-2 py-1 text-[11px] text-purple-100">
            {item.name}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function CollapseColumnLayer({ items = [], opacity = 0.54 }) {
  return (
    <>
      {items.map((item) => (
        <CollapseColumn key={item.id} item={item} opacity={opacity} />
      ))}
    </>
  );
}
