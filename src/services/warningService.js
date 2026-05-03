import { calcEntityDistance, moveBoundary } from "../utils/distance.js";

export const RISK_LEVEL_RANK = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const DEFAULT_NONE_LEVEL = {
  level: "none",
  label: "无预警",
  color: "#22c55e",
  suggestion: "当前无明显风险，维持常规巡检。",
};

let activeWarningRules = [];

export function setWarningRules(rules) {
  if (Array.isArray(rules)) {
    activeWarningRules = structuredClone(rules);
  }
}

function normalizeRiskType(riskType) {
  switch (riskType) {
    case "goaf_water_area":
    case "goaf_water":
      return "goaf_water";
    case "goaf_area":
    case "goaf":
      return "goaf";
    case "water_rich_area":
    case "water_inrush_point":
    case "water_inrush":
      return "water_inrush";
    case "gas_rich_area":
    case "gas_rich":
    case "gas":
      return "gas";
    case "small_mine_damage_area":
    case "small_mine_damage":
      return "small_mine_damage";
    case "fault_influence_zone":
    case "fault_influence":
      return "fault_influence";
    default:
      return riskType || "";
  }
}

function getRuleByRiskType(riskType) {
  const normalizedRiskType = normalizeRiskType(riskType);
  const warningRules = activeWarningRules;

  return (
    warningRules.find((rule) => rule.riskType === normalizedRiskType) ||
    warningRules.find((rule) => rule.riskType === riskType)
  );
}

function getRiskBodyRiskType(riskBody) {
  return riskBody?.riskType || riskBody?.type || "";
}

function getSafeName(entity, fallback) {
  return entity?.name || entity?.code || entity?.id || fallback;
}

function getRiskLevelRank(level) {
  return RISK_LEVEL_RANK[level] || 0;
}

function formatDistanceForReason(distance) {
  if (!Number.isFinite(distance)) {
    return "--";
  }

  return distance >= 100 ? distance.toFixed(0) : distance.toFixed(1);
}

function buildReason(workingFace, riskBody, distance, level) {
  const workingFaceName = getSafeName(workingFace, "当前工作面");
  const riskBodyName = getSafeName(riskBody, "风险体");
  const distanceText = formatDistanceForReason(distance);
  const influenceRadius = riskBody?.influenceRadius || riskBody?.influenceRange;

  if (level === "critical") {
    return `${workingFaceName}距${riskBodyName}仅${distanceText}m，已进入严重影响范围。`;
  }

  if (level === "none") {
    return `${workingFaceName}距${riskBodyName}${distanceText}m，当前未进入配置的预警范围。`;
  }

  if (influenceRadius) {
    return `${workingFaceName}距${riskBodyName}${distanceText}m，接近${influenceRadius}m模拟影响半径。`;
  }

  return `${workingFaceName}距${riskBodyName}${distanceText}m，接近模拟影响范围。`;
}

function getDistanceRuleBound(value, fallback) {
  if (value === Infinity) {
    return Infinity;
  }

  if (value == null) {
    return fallback;
  }

  const next = Number(value);

  return Number.isFinite(next) ? next : fallback;
}

function buildAdvancedWorkingFace(workingFace, advanceDistance) {
  if (!workingFace) {
    return null;
  }

  const safeAdvanceDistance = Number(advanceDistance) || 0;
  const canMove =
    Array.isArray(workingFace.boundary) &&
    Array.isArray(workingFace.advanceDirection);

  return {
    ...workingFace,
    boundary: canMove
      ? moveBoundary(
          workingFace.boundary,
          workingFace.advanceDirection,
          safeAdvanceDistance
        )
      : workingFace.boundary,
    currentAdvance: safeAdvanceDistance,
  };
}

function getDefaultWorkingFaceId(workingFaces) {
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

export function getRiskTypeLabel(riskType) {
  switch (normalizeRiskType(riskType)) {
    case "goaf_water":
      return "老空水";
    case "water_inrush":
      return "突水风险";
    case "gas":
      return "瓦斯富集";
    case "soft_layer":
      return "软分层";
    case "goaf":
      return "采空区";
    case "abandoned_shaft":
      return "废弃井筒";
    case "poor_sealed_borehole":
      return "封闭不良钻孔";
    case "fault":
    case "fault_influence":
    case "fault_influence_zone":
      return "断层构造";
    case "small_mine_damage":
    case "small_mine_damage_area":
      return "小窑破坏区";
    default:
      return "综合风险";
  }
}

/**
 * Match a warning level from a distance rule.
 * @param {object} rule
 * @param {number} distance
 * @returns {object}
 */
export function matchWarningLevel(rule, distance) {
  if (!rule || !Array.isArray(rule.levels) || rule.levels.length === 0) {
    return {
      ...DEFAULT_NONE_LEVEL,
      suggestion: "未配置预警规则，建议人工复核风险体属性。",
    };
  }

  if (!Number.isFinite(distance)) {
    return DEFAULT_NONE_LEVEL;
  }

  return (
    rule.levels.find((item) => {
      const minDistance = getDistanceRuleBound(item.minDistance, 0);
      const maxDistance = getDistanceRuleBound(item.maxDistance, Infinity);

      if (item.level === "none") {
        return distance >= minDistance;
      }

      return distance >= minDistance && distance < maxDistance;
    }) ||
    rule.levels.find((item) => item.level === "none") ||
    DEFAULT_NONE_LEVEL
  );
}

/**
 * Calculate the nearest risk bodies around one working face.
 * @param {object} workingFace
 * @param {object[]} riskBodies
 * @param {number} limit
 * @returns {object[]}
 */
export function getNearestRiskBodies(workingFace, riskBodies, limit = 3) {
  if (!workingFace || !Array.isArray(riskBodies) || riskBodies.length === 0) {
    return [];
  }

  const safeLimit = Math.max(0, Number.isFinite(Number(limit)) ? Number(limit) : 3);

  return riskBodies
    .filter(Boolean)
    .map((riskBody, index) => {
      const riskType = getRiskBodyRiskType(riskBody);
      const normalizedRiskType = normalizeRiskType(riskType);
      const rule = getRuleByRiskType(normalizedRiskType);
      const distance = calcEntityDistance(workingFace, riskBody);
      const matchedLevel = matchWarningLevel(rule, distance);
      const riskBodyId = riskBody.id || riskBody.code || `risk-body-${index}`;
      const riskBodyName = getSafeName(riskBody, "未命名风险体");
      const workingFaceName = getSafeName(workingFace, "当前工作面");
      const reason = buildReason(
        { ...workingFace, name: workingFaceName },
        { ...riskBody, name: riskBodyName },
        distance,
        matchedLevel?.level
      );

      return {
        riskBody,
        riskBodyId,
        riskBodyName,
        riskType,
        normalizedRiskType,
        riskTypeLabel: getRiskTypeLabel(normalizedRiskType || riskType),
        riskLevel: riskBody.riskLevel || matchedLevel?.level || "none",
        distance,
        rule,
        matchedLevel,
        warningReason: reason,
        reason,
        suggestion: matchedLevel?.suggestion || DEFAULT_NONE_LEVEL.suggestion,
      };
    })
    .sort((a, b) => {
      const distanceDiff = a.distance - b.distance;

      if (distanceDiff !== 0) {
        return distanceDiff;
      }

      return (
        getRiskLevelRank(b.matchedLevel?.level) -
        getRiskLevelRank(a.matchedLevel?.level)
      );
    })
    .slice(0, safeLimit);
}

/**
 * Build a working-face level risk summary suitable for panel display.
 * @param {object} workingFace
 * @param {object[]} riskBodies
 * @returns {object}
 */
export function buildWorkingFaceRiskSummary(workingFace, riskBodies) {
  if (!workingFace || !Array.isArray(riskBodies) || riskBodies.length === 0) {
    return {
      workingFaceId: workingFace?.id || "",
      workingFaceName: getSafeName(workingFace, "当前工作面"),
      highestLevel: "none",
      highestLabel: DEFAULT_NONE_LEVEL.label,
      highestColor: DEFAULT_NONE_LEVEL.color,
      warningCount: 0,
      nearestDistance: null,
      mainRiskTypes: [],
      nearestRisks: [],
    };
  }

  const allRisks = getNearestRiskBodies(workingFace, riskBodies, riskBodies.length);
  const nearestRisks = allRisks.slice(0, 3);
  const warningRisks = allRisks.filter(
    (risk) => getRiskLevelRank(risk.matchedLevel?.level) > 0
  );
  const highestRisk = warningRisks.reduce((highest, risk) => {
    if (!highest) {
      return risk;
    }

    return getRiskLevelRank(risk.matchedLevel?.level) >
      getRiskLevelRank(highest.matchedLevel?.level)
      ? risk
      : highest;
  }, null);
  const highestLevel = highestRisk?.matchedLevel || DEFAULT_NONE_LEVEL;
  const typeSource = warningRisks.length > 0 ? warningRisks : nearestRisks;
  const mainRiskTypes = [
    ...new Set(typeSource.map((risk) => risk.riskTypeLabel).filter(Boolean)),
  ];

  return {
    workingFaceId: workingFace.id || "",
    workingFaceName: getSafeName(workingFace, "当前工作面"),
    highestLevel: highestLevel.level,
    highestLabel: highestLevel.label,
    highestColor: highestLevel.color,
    warningCount: warningRisks.length,
    nearestDistance: nearestRisks[0]?.distance ?? null,
    mainRiskTypes,
    nearestRisks,
  };
}

/**
 * Generate warnings for current working-face and risk-body positions.
 * @param {object[]} workingFaces
 * @param {object[]} riskBodies
 * @returns {object[]}
 */
export function generateWarnings(workingFaces, riskBodies) {
  if (!Array.isArray(workingFaces) || !Array.isArray(riskBodies)) {
    return [];
  }

  return workingFaces.flatMap((workingFace) =>
    getNearestRiskBodies(workingFace, riskBodies, riskBodies.length)
      .filter((risk) => risk.matchedLevel?.level !== "none")
      .map((risk) => ({
        id: `${workingFace.id || "working-face"}-${risk.riskBodyId}-${risk.matchedLevel.level}`,
        workingFaceId: workingFace.id,
        workingFaceName: getSafeName(workingFace, "当前工作面"),
        riskBodyId: risk.riskBodyId,
        riskBodyName: risk.riskBodyName,
        riskType: risk.riskType,
        distance: risk.distance,
        level: risk.matchedLevel.level,
        label: risk.matchedLevel.label,
        color: risk.matchedLevel.color,
        reason: risk.reason,
        suggestion: risk.suggestion,
        status: "active",
        createdAt: new Date().toISOString(),
      }))
  );
}

/**
 * Move working faces by the given advance distance and recalculate warnings.
 * @param {object[]} workingFaces
 * @param {object[]} riskBodies
 * @param {number} advanceDistance
 * @param {string} selectedWorkingFaceId
 * @returns {object[]}
 */
export function generateWarningsByAdvance(
  workingFaces,
  riskBodies,
  advanceDistance,
  selectedWorkingFaceId = ""
) {
  if (!Array.isArray(workingFaces)) {
    return [];
  }

  const hasSelectedWorkingFace = workingFaces.some(
    (workingFace) => workingFace.id === selectedWorkingFaceId
  );
  const advancingWorkingFaceId = hasSelectedWorkingFace
    ? selectedWorkingFaceId
    : getDefaultWorkingFaceId(workingFaces);
  const movedWorkingFaces = workingFaces
    .map((workingFace) =>
      buildAdvancedWorkingFace(
        workingFace,
        workingFace.id === advancingWorkingFaceId
          ? advanceDistance
          : workingFace.currentAdvance
      )
    )
    .filter(Boolean);

  return generateWarnings(movedWorkingFaces, riskBodies);
}
