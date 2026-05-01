import * as THREE from "three";
import { useMemo } from "react";
import { getCenter } from "../../utils/distance";

function getEntityCenter(entity) {
  if (entity?.position) {
    return entity.position;
  }

  if (entity?.boundary) {
    return getCenter(entity.boundary);
  }

  if (entity?.points) {
    return getCenter(entity.points);
  }

  return [0, 0, 0];
}

export default function DistanceLine({ from, to, color = "#facc15" }) {
  const geometry = useMemo(() => {
    const fromCenter = getEntityCenter(from);
    const toCenter = getEntityCenter(to);
    const lineGeometry = new THREE.BufferGeometry();

    lineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([...fromCenter, ...toCenter], 3)
    );

    return lineGeometry;
  }, [from, to]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.95} />
    </line>
  );
}
