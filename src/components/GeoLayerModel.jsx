import * as THREE from "three";
import { useMemo, useState } from "react";
import { Html, useCursor } from "@react-three/drei";
import {
  buildLayerStack,
  createBlobGeometry,
  createCapGeometry,
  createFootprint,
  createOutlineGeometry,
  createSideGeometry,
  darkenColor,
  lightenColor,
} from "../utils/geoLayerUtils";

function BlobPatch({ cx, cz, y, rx, rz, seed }) {
  const geometry = useMemo(
    () => createBlobGeometry(cx, cz, y, rx, rz, 24, seed),
    [cx, cz, y, rx, rz, seed]
  );

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#82b2c0"
        roughness={0.95}
        transparent
        opacity={0.55}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function GeologicalLayer({
  layer,
  totalLayers,
  points,
  explode,
  selected,
  onSelect,
}) {
  const [hovered, setHovered] = useState(false);

  useCursor(hovered);

  const gap = 0.28 * explode;
  const offsetY = gap * (totalLayers - 1 - layer.index);
  const middleY = (layer.yTop + layer.yBottom) / 2;

  const topGeometry = useMemo(
    () => createCapGeometry(points, layer.yTop, false),
    [points, layer.yTop]
  );

  const bottomGeometry = useMemo(
    () => createCapGeometry(points, layer.yBottom, true),
    [points, layer.yBottom]
  );

  const sideGeometry = useMemo(
    () => createSideGeometry(points, layer.yTop, layer.yBottom),
    [points, layer.yTop, layer.yBottom]
  );

  const topOutline = useMemo(
    () => createOutlineGeometry(points, layer.yTop + 0.001),
    [points, layer.yTop]
  );

  const bottomOutline = useMemo(
    () => createOutlineGeometry(points, layer.yBottom - 0.001),
    [points, layer.yBottom]
  );

  return (
    <group position={[0, offsetY, 0]}>
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelect(layer.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => {
          setHovered(false);
        }}
      >
        <mesh geometry={sideGeometry}>
          <meshStandardMaterial
            color={selected ? lightenColor(layer.color, 0.12) : layer.color}
            roughness={0.9}
            metalness={0.03}
            transparent
            opacity={selected ? 1 : 0.94}
            emissive={selected ? "#ffffff" : "#000000"}
            emissiveIntensity={selected ? 0.12 : 0}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh geometry={topGeometry}>
          <meshStandardMaterial
            color={selected ? lightenColor(layer.color, 0.18) : layer.color}
            roughness={0.82}
            metalness={0.02}
            emissive={selected ? "#ffffff" : "#000000"}
            emissiveIntensity={selected ? 0.08 : 0}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh geometry={bottomGeometry}>
          <meshStandardMaterial
            color={darkenColor(layer.color, 0.12)}
            roughness={0.92}
            metalness={0.01}
            side={THREE.DoubleSide}
          />
        </mesh>

        <lineSegments geometry={topOutline}>
          <lineBasicMaterial color={selected ? "#ffe8a3" : "#1f6581"} />
        </lineSegments>

        <lineSegments geometry={bottomOutline}>
          <lineBasicMaterial color={selected ? "#ffd16b" : "#d17c39"} />
        </lineSegments>

        {hovered && (
          <Html
            position={[4.45, middleY, 0]}
            center
            distanceFactor={8}
            transform={false}
          >
            <div className="pointer-events-none min-w-[150px] whitespace-nowrap rounded-lg bg-[rgba(30,35,38,0.88)] px-[10px] py-2 text-xs leading-[1.6] text-white shadow-[0_8px_18px_rgba(0,0,0,0.22)]">
              <div className="tooltip-title">{layer.name}</div>
              <div>岩性：{layer.lithology}</div>
              <div>厚度：{Number(layer.thickness).toFixed(2)} m</div>
              <div>渗透性：{layer.permeability}</div>
            </div>
          </Html>
        )}

        {explode > 0.12 && (
          <Html
            position={[0, layer.yTop + 0.03, 0]}
            center
            distanceFactor={8}
            transform={false}
          >
            <div
              className={`pointer-events-none whitespace-nowrap rounded-[6px] border bg-white/[0.92] px-2 py-1 text-xs text-[#444] shadow-[0_4px_12px_rgba(0,0,0,0.12)] ${
                selected
                  ? "border-[rgba(13,95,136,0.3)] font-bold text-[#0d5f88]"
                  : "border-black/[0.08]"
              }`}
            >
              {layer.name}
            </div>
          </Html>
        )}
      </group>

      {layer.index === 0 && (
        <>
          <BlobPatch
            cx={1.6}
            cz={1.1}
            y={layer.yTop + 0.025}
            rx={0.95}
            rz={0.32}
            seed={1}
          />
          <BlobPatch
            cx={2.25}
            cz={1.1}
            y={layer.yTop + 0.028}
            rx={0.7}
            rz={0.23}
            seed={2}
          />
          <BlobPatch
            cx={-1.55}
            cz={-0.65}
            y={layer.yTop + 0.03}
            rx={0.7}
            rz={0.38}
            seed={3}
          />
          <BlobPatch
            cx={-0.55}
            cz={-0.25}
            y={layer.yTop + 0.028}
            rx={0.28}
            rz={0.18}
            seed={4}
          />
          <BlobPatch
            cx={0.6}
            cz={-1.2}
            y={layer.yTop + 0.028}
            rx={0.35}
            rz={0.28}
            seed={5}
          />
        </>
      )}
    </group>
  );
}

export default function GeoLayerModel({
  layerData,
  visibleLayerIds,
  explode,
  selectedLayerId,
  onSelectLayer,
}) {
  const points = useMemo(() => createFootprint(8, 4.6, 22), []);
  const layers = useMemo(() => buildLayerStack(layerData), [layerData]);

  return (
    <group rotation={[0, -0.22, 0]}>
      {layers
        .filter((layer) => visibleLayerIds.has(layer.id))
        .map((layer) => (
          <GeologicalLayer
            key={layer.id}
            layer={layer}
            totalLayers={layers.length}
            points={points}
            explode={explode}
            selected={selectedLayerId === layer.id}
            onSelect={onSelectLayer}
          />
        ))}
    </group>
  );
}
