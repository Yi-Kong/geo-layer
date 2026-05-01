import { warningRules } from "../mock/index.js";
import { calcEntityDistance, moveBoundary } from "../utils/distance.js";

function getRuleByRiskType(riskType) {
  return warningRules.find((rule) => rule.riskType === riskType);
}

function buildReason(workingFace, riskBody, distance, level) {
  const distanceText = distance.toFixed(distance >= 100 ? 0 : 1);

  if (level === "critical") {
    return `${workingFace.name}距${riskBody.name}仅${distanceText}m，已进入严重影响范围。`;
  }

  return `${workingFace.name}距${riskBody.name}${distanceText}m，接近${riskBody.influenceRadius}m模拟影响半径。`;
}

/**
 * Match a warning level from a distance rule.
 * @param {object} rule
 * @param {number} distance
 * @returns {object}
 */
export function matchWarningLevel(rule, distance) {
  if (!rule) {
    return {
      level: "none",
      label: "无预警",
      color: "#22c55e",
      suggestion: "未配置预警规则。",
    };
  }

  return (
    rule.levels.find((item) => {
      if (item.level === "none") {
        return distance >= item.minDistance;
      }

      return distance >= item.minDistance && distance < item.maxDistance;
    }) || rule.levels.find((item) => item.level === "none")
  );
}

/**
 * Generate warnings for current working-face and risk-body positions.
 * @param {object[]} workingFaces
 * @param {object[]} riskBodies
 * @returns {object[]}
 */
export function generateWarnings(workingFaces, riskBodies) {
  return workingFaces.flatMap((workingFace) => {
    return riskBodies
      .map((riskBody) => {
        const rule = getRuleByRiskType(riskBody.riskType);
        const distance = calcEntityDistance(workingFace, riskBody);
        const level = matchWarningLevel(rule, distance);

        if (!level || level.level === "none") {
          return null;
        }

        return {
          id: `${workingFace.id}-${riskBody.id}-${level.level}`,
          workingFaceId: workingFace.id,
          workingFaceName: workingFace.name,
          riskBodyId: riskBody.id,
          riskBodyName: riskBody.name,
          riskType: riskBody.riskType,
          distance,
          level: level.level,
          label: level.label,
          color: level.color,
          reason: buildReason(workingFace, riskBody, distance, level.level),
          suggestion: level.suggestion,
          status: "active",
          createdAt: new Date().toISOString(),
        };
      })
      .filter(Boolean);
  });
}

/**
 * Move working faces by the given advance distance and recalculate warnings.
 * @param {object[]} workingFaces
 * @param {object[]} riskBodies
 * @param {number} advanceDistance
 * @returns {object[]}
 */
export function generateWarningsByAdvance(
  workingFaces,
  riskBodies,
  advanceDistance
) {
  const movedWorkingFaces = workingFaces.map((workingFace) => ({
    ...workingFace,
    boundary: moveBoundary(
      workingFace.boundary,
      workingFace.advanceDirection,
      Number(advanceDistance) || 0
    ),
    currentAdvance: Number(advanceDistance) || 0,
  }));

  return generateWarnings(movedWorkingFaces, riskBodies);
}
