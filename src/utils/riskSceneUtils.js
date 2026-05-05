export const RISK_LEVEL_COLORS = {
  low: "#2A9D8F",
  medium: "#E9C46A",
  high: "#F4A261",
  critical: "#E63946",
};

export const DEFAULT_HIGHLIGHT_COLOR = "#facc15";
export const HIGH_PRIORITY_LEVELS = ["critical", "high"];

export const RISK_BODY_LAYER_BY_TYPE = {
  goaf_water: "goafWaterAreas",
  goaf_water_area: "goafWaterAreas",
  water_inrush: "waterRichAreas",
  water_rich_area: "waterRichAreas",
  gas: "gasRichAreas",
  gas_rich_area: "gasRichAreas",
  soft_layer: "softLayers",
  small_mine_damage: "smallMineDamageAreas",
  small_mine_damage_area: "smallMineDamageAreas",
  goaf: "goafAreas",
  goaf_area: "goafAreas",
  abandoned_shaft: "abandonedShafts",
  poor_sealed_borehole: "poorSealedBoreholes",
  fault_influence: "faultInfluenceZones",
  fault_influence_zone: "faultInfluenceZones",
};

export function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

export function getSafePoint(point) {
  if (!Array.isArray(point)) {
    return [0, 0, 0];
  }

  return [
    toFiniteNumber(point[0]),
    toFiniteNumber(point[1]),
    toFiniteNumber(point[2]),
  ];
}

export function getBodyPointSource(body) {
  if (Array.isArray(body?.points) && body.points.length > 0) {
    return body.points;
  }

  if (Array.isArray(body?.boundary) && body.boundary.length > 0) {
    return body.boundary;
  }

  return [];
}

export function getBodyCenter(body) {
  if (!body) {
    return [0, 0, 0];
  }

  if (Array.isArray(body.position) && body.position.length >= 3) {
    return getSafePoint(body.position);
  }

  const points = getBodyPointSource(body);

  if (points.length === 0) {
    return [0, 0, 0];
  }

  const total = points.reduce(
    (sum, point) => {
      const safePoint = getSafePoint(point);

      return [
        sum[0] + safePoint[0],
        sum[1] + safePoint[1],
        sum[2] + safePoint[2],
      ];
    },
    [0, 0, 0]
  );

  return total.map((value) => value / points.length);
}

export function getBodySize(body) {
  if (Array.isArray(body?.size) && body.size.length > 0) {
    return [0, 1, 2].map((index) =>
      Math.max(1, Math.abs(toFiniteNumber(body.size[index], 1)))
    );
  }

  const points = getBodyPointSource(body);

  if (points.length > 0) {
    const bounds = points.reduce(
      (result, point) => {
        const safePoint = getSafePoint(point);

        safePoint.forEach((value, index) => {
          result.min[index] = Math.min(result.min[index], value);
          result.max[index] = Math.max(result.max[index], value);
        });

        return result;
      },
      {
        min: [Infinity, Infinity, Infinity],
        max: [-Infinity, -Infinity, -Infinity],
      }
    );

    return bounds.max.map((value, index) =>
      Math.max(1, value - bounds.min[index])
    );
  }

  return [1, 1, 1];
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getInfluenceRadius(body) {
  const radius = toFiniteNumber(
    body?.influenceRadius ?? body?.influenceRange ?? body?.radius,
    NaN
  );

  if (Number.isFinite(radius) && radius > 0) {
    return clamp(radius, 18, 260);
  }

  const size = getBodySize(body);
  const maxSize = Math.max(...size);

  if (maxSize > 0) {
    return clamp(maxSize * 0.75, 18, 220);
  }

  return 34;
}

export function getHighlightRadius(body) {
  const size = getBodySize(body);
  const maxSize = Math.max(...size);

  return clamp(maxSize * 0.22, 12, 46);
}

export function getWarningLevel(warning) {
  return warning?.level || warning?.riskLevel || "none";
}

export function getRiskLevel(body) {
  return body?.riskLevel || body?.level || "none";
}

export function getRiskColor(body, warning) {
  const warningLevel = getWarningLevel(warning);
  const riskLevel = getRiskLevel(body);

  return (
    warning?.color ||
    body?.color ||
    RISK_LEVEL_COLORS[warningLevel] ||
    RISK_LEVEL_COLORS[riskLevel] ||
    DEFAULT_HIGHLIGHT_COLOR
  );
}

export function getRiskBodyWarning(riskBodyId, generatedWarnings = []) {
  if (!riskBodyId) {
    return null;
  }

  return (
    generatedWarnings.find((warning) => warning.riskBodyId === riskBodyId) ||
    null
  );
}

export function shouldShowWarningDistanceLine(warning, selectedRiskBodyId) {
  if (selectedRiskBodyId) {
    return warning.riskBodyId === selectedRiskBodyId;
  }

  return HIGH_PRIORITY_LEVELS.includes(getWarningLevel(warning));
}

export function getWarningKey(warning, index) {
  return (
    warning?.id ||
    `${warning?.workingFaceId || "working-face"}-${warning?.riskBodyId || "risk-body"}-${index}`
  );
}

export function getDefaultWorkingFaceId(workingFaces) {
  return (
    workingFaces.find(
      (face) =>
        face.status === "mining" ||
        face.stage === "active" ||
        face.stage === "mining"
    )?.id ||
    workingFaces[0]?.id ||
    ""
  );
}

export function getRiskBodyLayerId(body) {
  return (
    RISK_BODY_LAYER_BY_TYPE[body?.riskType] ||
    RISK_BODY_LAYER_BY_TYPE[body?.type] ||
    null
  );
}

export function isRiskBodyLayerVisible(body, layers = {}) {
  const layerId = getRiskBodyLayerId(body);

  return !layerId || layers[layerId] !== false;
}
