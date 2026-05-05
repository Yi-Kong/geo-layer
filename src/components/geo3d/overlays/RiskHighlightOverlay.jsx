import * as THREE from "three";
import {
  DEFAULT_HIGHLIGHT_COLOR,
  clamp,
  getBodyCenter,
  getBodySize,
  getHighlightRadius,
  getInfluenceRadius,
} from "../../../utils/riskSceneUtils";
import InfluenceRange from "./InfluenceRange";
import PulseRing from "./PulseRing";

const DISABLE_RAYCAST = () => null;

export default function RiskHighlightOverlay({
  riskBody,
  color = DEFAULT_HIGHLIGHT_COLOR,
  level = "none",
  showInfluenceRange = true,
}) {
  if (!riskBody) {
    return null;
  }

  const center = getBodyCenter(riskBody);
  const size = getBodySize(riskBody);
  const radius = getHighlightRadius(riskBody);
  const ringRadius = clamp(
    getInfluenceRadius(riskBody) * 0.18,
    radius * 1.2,
    64
  );
  const markerY = center[1] + radius * 0.45 + 12;
  const ringY = center[1] - Math.min(size[1] * 0.5, 10);
  const pulse = level === "critical";

  return (
    <group>
      {showInfluenceRange && <InfluenceRange body={riskBody} color={color} />}
      <mesh raycast={DISABLE_RAYCAST} position={[center[0], markerY, center[2]]}>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.24}
          depthWrite={false}
        />
      </mesh>
      <mesh
        raycast={DISABLE_RAYCAST}
        position={[center[0], ringY, center[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[ringRadius * 0.82, ringRadius, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.72}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {pulse && <PulseRing body={riskBody} color={color} />}
    </group>
  );
}
