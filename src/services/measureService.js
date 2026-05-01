import { treatmentMeasures } from "../mock/index.js";

export function getMeasuresByRiskType(riskType) {
  return treatmentMeasures.filter((measure) =>
    measure.riskTypes.includes(riskType)
  );
}

export function getRecommendedMeasures(warning) {
  const measures = getMeasuresByRiskType(warning?.riskType);

  if (warning?.level === "critical") {
    return [
      ...measures.filter((measure) => measure.strict),
      ...measures.filter((measure) => !measure.strict),
    ];
  }

  return measures;
}
