import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  DEFAULT_HIGHLIGHT_COLOR,
  getBodyCenter,
  getInfluenceRadius,
} from "../../../utils/riskSceneUtils";

const DISABLE_RAYCAST = () => null;

export default function PulseRing({ body, color = DEFAULT_HIGHLIGHT_COLOR }) {
  const ref = useRef(null);
  const elapsedRef = useRef(0);
  const center = getBodyCenter(body);
  const radius = getInfluenceRadius(body);

  useFrame((_, delta) => {
    if (!ref.current) {
      return;
    }

    elapsedRef.current += delta;

    const wave = Math.sin(elapsedRef.current * 2.4);
    const scale = 1 + wave * 0.06;
    const opacity = 0.26 + wave * 0.08;

    ref.current.scale.setScalar(scale);

    if (ref.current.material) {
      ref.current.material.opacity = opacity;
    }
  });

  if (!Number.isFinite(radius) || radius <= 0) {
    return null;
  }

  return (
    <mesh
      ref={ref}
      raycast={DISABLE_RAYCAST}
      position={[center[0], center[1] + 0.5, center[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[radius * 0.72, radius, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.26}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
