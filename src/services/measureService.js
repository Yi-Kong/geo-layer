import { treatmentMeasures as fallbackTreatmentMeasures } from "../mock/index.js";

let activeTreatmentMeasures = fallbackTreatmentMeasures;

export function setTreatmentMeasures(measures) {
  if (Array.isArray(measures)) {
    activeTreatmentMeasures = structuredClone(measures);
  }
}

export function getMeasuresByRiskType(riskType) {
  return activeTreatmentMeasures.filter((measure) =>
    measure.riskTypes?.includes(riskType)
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
