import * as THREE from "three";
import {
  DEFAULT_HIGHLIGHT_COLOR,
  getBodyCenter,
  getInfluenceRadius,
} from "../../../utils/riskSceneUtils";

const DISABLE_RAYCAST = () => null;

export default function InfluenceRange({
  body,
  color = DEFAULT_HIGHLIGHT_COLOR,
}) {
  const center = getBodyCenter(body);
  const radius = getInfluenceRadius(body);

  if (!Number.isFinite(radius) || radius <= 0) {
    return null;
  }

  return (
    <group>
      <mesh raycast={DISABLE_RAYCAST} position={center}>
        <sphereGeometry args={[radius, 32, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh
        raycast={DISABLE_RAYCAST}
        position={[center[0], center[1] - 2, center[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[radius * 0.92, radius, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.36}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
