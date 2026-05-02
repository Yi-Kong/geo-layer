function toPoint3D(point) {
  if (!point) {
    return null;
  }

  if (Array.isArray(point)) {
    return [
      Number.isFinite(Number(point[0])) ? Number(point[0]) : 0,
      Number.isFinite(Number(point[1])) ? Number(point[1]) : 0,
      Number.isFinite(Number(point[2])) ? Number(point[2]) : 0,
    ];
  }

  return [
    Number.isFinite(Number(point.x)) ? Number(point.x) : 0,
    Number.isFinite(Number(point.y)) ? Number(point.y) : 0,
    Number.isFinite(Number(point.z)) ? Number(point.z) : 0,
  ];
}

function getEntityPoints(entity) {
  if (!entity) {
    return [];
  }

  if (entity.position) {
    return [toPoint3D(entity.position)];
  }

  if (Array.isArray(entity.boundary) && entity.boundary.length > 0) {
    return entity.boundary.map(toPoint3D).filter(Boolean);
  }

  if (Array.isArray(entity.points) && entity.points.length > 0) {
    return entity.points.map(toPoint3D).filter(Boolean);
  }

  return [];
}

function getBounds(points) {
  const bounds = {
    min: [Infinity, Infinity, Infinity],
    max: [-Infinity, -Infinity, -Infinity],
  };

  points.forEach((point) => {
    point.forEach((value, index) => {
      bounds.min[index] = Math.min(bounds.min[index], value);
      bounds.max[index] = Math.max(bounds.max[index], value);
    });
  });

  return bounds;
}

function calcBoundsDistance(boundsA, boundsB) {
  const delta = [0, 1, 2].map((index) => {
    if (boundsA.max[index] < boundsB.min[index]) {
      return boundsB.min[index] - boundsA.max[index];
    }

    if (boundsB.max[index] < boundsA.min[index]) {
      return boundsA.min[index] - boundsB.max[index];
    }

    return 0;
  });

  return calcDistance3D(delta, [0, 0, 0]);
}

/**
 * Calculate the geometric center of a 3D point collection.
 * @param {Array<Array<number>|{x:number,y:number,z:number}>} points
 * @returns {number[]} center point in [x, y, z]
 */
export function getCenter(points) {
  if (!Array.isArray(points) || points.length === 0) {
    return [0, 0, 0];
  }

  const center = points.reduce(
    (sum, item) => {
      const point = toPoint3D(item);
      return [
        sum[0] + point[0],
        sum[1] + point[1],
        sum[2] + point[2],
      ];
    },
    [0, 0, 0]
  );

  return center.map((value) => value / points.length);
}

/**
 * Calculate Euclidean distance between two 3D points.
 * @param {number[]|{x:number,y:number,z:number}} a
 * @param {number[]|{x:number,y:number,z:number}} b
 * @returns {number}
 */
export function calcDistance3D(a, b) {
  const pointA = toPoint3D(a);
  const pointB = toPoint3D(b);

  if (!pointA || !pointB) {
    return 0;
  }

  return Math.hypot(
    pointA[0] - pointB[0],
    pointA[1] - pointB[1],
    pointA[2] - pointB[2]
  );
}

/**
 * Calculate distance between entities using position, boundary or volume points.
 * Multi-point entities use bounding-box distance, which better matches the demo
 * need of warning when a working face approaches a risk volume.
 * @param {object} entityA
 * @param {object} entityB
 * @returns {number}
 */
export function calcEntityDistance(entityA, entityB) {
  const pointsA = getEntityPoints(entityA);
  const pointsB = getEntityPoints(entityB);

  if (pointsA.length === 0 || pointsB.length === 0) {
    return 0;
  }

  if (pointsA.length === 1 && pointsB.length === 1) {
    return calcDistance3D(pointsA[0], pointsB[0]);
  }

  return calcBoundsDistance(getBounds(pointsA), getBounds(pointsB));
}

/**
 * Move a working-face boundary along a normalized direction by a distance.
 * @param {number[][]} boundary
 * @param {number[]} direction
 * @param {number} distance
 * @returns {number[][]}
 */
export function moveBoundary(boundary, direction, distance) {
  if (!Array.isArray(boundary)) {
    return [];
  }

  const vector = Array.isArray(direction) ? direction : [0, 0, 0];
  const safeVector = [
    Number.isFinite(Number(vector[0])) ? Number(vector[0]) : 0,
    Number.isFinite(Number(vector[1])) ? Number(vector[1]) : 0,
    Number.isFinite(Number(vector[2])) ? Number(vector[2]) : 0,
  ];
  const safeDistance = Number.isFinite(Number(distance)) ? Number(distance) : 0;
  const length = Math.hypot(...safeVector) || 1;
  const unit = safeVector.map((value) => value / length);

  return boundary.map((point) => {
    const point3D = toPoint3D(point);

    return [
      point3D[0] + unit[0] * safeDistance,
      point3D[1] + unit[1] * safeDistance,
      point3D[2] + unit[2] * safeDistance,
    ];
  });
}
