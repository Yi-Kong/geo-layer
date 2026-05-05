import * as THREE from "three";
import {
  DEFAULT_HIGHLIGHT_COLOR,
  clamp,
  getBodyCenter,
  getHighlightRadius,
} from "../../../utils/riskSceneUtils";

const DISABLE_RAYCAST = () => null;

export default function WarningMarker({
  body,
  color = DEFAULT_HIGHLIGHT_COLOR,
}) {
  const center = getBodyCenter(body);
  const radius = clamp(getHighlightRadius(body) * 0.32, 6, 12);
  const markerOffset = radius + 16;

  return (
    <group position={[center[0], center[1] + markerOffset, center[2]]}>
      <mesh raycast={DISABLE_RAYCAST}>
        <sphereGeometry args={[radius, 18, 18]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.92}
          depthWrite={false}
        />
      </mesh>
      <mesh raycast={DISABLE_RAYCAST} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.24, radius * 1.74, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh
        raycast={DISABLE_RAYCAST}
        position={[0, -markerOffset * 0.45, 0]}
      >
        <cylinderGeometry args={[0.9, 0.9, markerOffset * 0.72, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.46}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
