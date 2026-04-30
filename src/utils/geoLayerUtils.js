import * as THREE from "three";

export function createFootprint(width = 8, depth = 4.6, segment = 22) {
  const pts = [];
  const halfW = width / 2;
  const halfD = depth / 2;

  for (let i = 0; i <= segment; i++) {
    const t = i / segment;
    const x = -halfW + width * t;
    const z =
      -halfD +
      0.18 * Math.sin(t * Math.PI * 3) +
      0.08 * Math.sin(t * Math.PI * 9);

    pts.push(new THREE.Vector2(x, z));
  }

  for (let i = 1; i <= segment; i++) {
    const t = i / segment;
    const x = halfW + 0.04 * Math.sin(t * Math.PI * 4);
    const z = -halfD + depth * t;

    pts.push(new THREE.Vector2(x, z));
  }

  for (let i = 1; i <= segment; i++) {
    const t = i / segment;
    const x = halfW - width * t;
    const z = halfD + 0.04 * Math.sin(t * Math.PI * 5);

    pts.push(new THREE.Vector2(x, z));
  }

  for (let i = 1; i < segment; i++) {
    const t = i / segment;
    const x =
      -halfW +
      0.14 * Math.sin(t * Math.PI * 2) +
      0.06 * Math.sin(t * Math.PI * 8);
    const z = halfD - depth * t;

    pts.push(new THREE.Vector2(x, z));
  }

  return pts;
}

export function createCapGeometry(points, y, reverse = false) {
  const positions = [];

  let centerX = 0;
  let centerZ = 0;

  points.forEach((p) => {
    centerX += p.x;
    centerZ += p.y;
  });

  centerX /= points.length;
  centerZ /= points.length;

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];

    if (!reverse) {
      positions.push(centerX, y, centerZ);
      positions.push(p1.x, y, p1.y);
      positions.push(p2.x, y, p2.y);
    } else {
      positions.push(centerX, y, centerZ);
      positions.push(p2.x, y, p2.y);
      positions.push(p1.x, y, p1.y);
    }
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  geometry.computeVertexNormals();

  return geometry;
}

export function createSideGeometry(points, yTop, yBottom) {
  const positions = [];

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];

    positions.push(p1.x, yTop, p1.y);
    positions.push(p1.x, yBottom, p1.y);
    positions.push(p2.x, yBottom, p2.y);

    positions.push(p1.x, yTop, p1.y);
    positions.push(p2.x, yBottom, p2.y);
    positions.push(p2.x, yTop, p2.y);
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  geometry.computeVertexNormals();

  return geometry;
}

export function createOutlineGeometry(points, y) {
  const positions = [];

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];

    positions.push(p1.x, y, p1.y);
    positions.push(p2.x, y, p2.y);
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  return geometry;
}

export function createBlobGeometry(cx, cz, y, rx, rz, count = 20, seed = 1) {
  const positions = [];
  const center = new THREE.Vector3(cx, y, cz);

  const randomLike = (i) =>
    0.78 +
    0.24 *
      Math.sin(i * 12.9898 + seed * 78.233) *
      Math.sin(i * 4.123 + seed * 17.17);

  const pts = [];

  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count;
    const r = randomLike(i);

    const x = cx + Math.cos(a) * rx * r;
    const z = cz + Math.sin(a) * rz * r;

    pts.push(new THREE.Vector3(x, y, z));
  }

  for (let i = 0; i < count; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % count];

    positions.push(center.x, center.y, center.z);
    positions.push(p1.x, p1.y, p1.z);
    positions.push(p2.x, p2.y, p2.z);
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  geometry.computeVertexNormals();

  return geometry;
}

export function lightenColor(hex, amount = 0.1) {
  const color = new THREE.Color(hex);

  color.r = Math.min(1, color.r + amount);
  color.g = Math.min(1, color.g + amount);
  color.b = Math.min(1, color.b + amount);

  return `#${color.getHexString()}`;
}

export function darkenColor(hex, amount = 0.1) {
  const color = new THREE.Color(hex);

  color.r = Math.max(0, color.r - amount);
  color.g = Math.max(0, color.g - amount);
  color.b = Math.max(0, color.b - amount);

  return `#${color.getHexString()}`;
}

export function buildLayerStack(layerData) {
  const totalThickness = layerData.reduce(
    (sum, layer) => sum + Number(layer.thickness || 0),
    0
  );

  let currentY = totalThickness / 2;

  return layerData.map((layer, index) => {
    const thickness = Number(layer.thickness || 0.1);
    const yTop = currentY;
    const yBottom = currentY - thickness;

    currentY = yBottom;

    return {
      ...layer,
      index,
      thickness,
      yTop,
      yBottom,
    };
  });
}
