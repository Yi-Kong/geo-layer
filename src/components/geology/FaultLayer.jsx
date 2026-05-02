import * as THREE from "three";
import { useState } from "react";
import { Edges, Html, useCursor } from "@react-three/drei";
import { useSelectionStore } from "../../store/selectionStore";

function Fault({ fault, opacity }) {
  const [hovered, setHovered] = useState(false);
  const selectedObject = useSelectionStore((state) => state.selectedObject);
  const selectObject = useSelectionStore((state) => state.selectObject);
  const selected = selectedObject?.id === fault.id;

  useCursor(hovered);

  return (
    <group>
      <mesh
        position={fault.position}
        rotation={fault.rotation || [0, 0, 0]}
        onClick={(event) => {
          event.stopPropagation();
          selectObject(fault);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={fault.size} />
        <meshStandardMaterial
          color={selected ? "#ffffff" : fault.color}
          emissive={fault.color}
          emissiveIntensity={selected ? 0.22 : 0.08}
          transparent
          opacity={selected ? Math.min(1, opacity + 0.18) : opacity}
          roughness={0.7}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
        <Edges color={selected ? "#ffffff" : "#fb7185"} threshold={15} />
      </mesh>

      {(hovered || selected) && (
        <Html
          position={[
            fault.position[0],
            fault.position[1] + fault.size[1] / 2 + 16,
            fault.position[2],
          ]}
          center
          distanceFactor={520}
        >
          <div className="pointer-events-none min-w-[128px] border border-red-300/30 bg-slate-950/85 px-2 py-1 text-[11px] leading-4 text-red-100">
            <div className="font-semibold">{fault.name}</div>
            <div>落差 {fault.drop} m / 倾角 {fault.dipAngle}°</div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function FaultLayer({ items = [], opacity = 0.72 }) {
  return (
    <>
      {items.map((fault) => (
        <Fault key={fault.id} fault={fault} opacity={opacity} />
      ))}
    </>
  );
}
