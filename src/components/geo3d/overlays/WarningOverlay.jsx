import DistanceLine from "../../mining/DistanceLine";
import { moveBoundary } from "../../../utils/distance";
import {
  getRiskColor,
  getWarningKey,
  shouldShowWarningDistanceLine,
} from "../../../utils/riskSceneUtils";
import WarningMarker from "./WarningMarker";

function buildMovedWorkingFace(workingFace, advanceDistance) {
  if (!workingFace) {
    return null;
  }

  const canMove =
    Array.isArray(workingFace.boundary) &&
    workingFace.boundary.length > 0 &&
    Array.isArray(workingFace.advanceDirection);

  return {
    ...workingFace,
    boundary: canMove
      ? moveBoundary(
          workingFace.boundary,
          workingFace.advanceDirection,
          advanceDistance
        )
      : workingFace.boundary,
  };
}

export default function WarningOverlay({
  visible,
  generatedWarnings = [],
  workingFaces = [],
  riskBodies = [],
  advanceDistance = 0,
  advancingWorkingFaceId = "",
  focusedRiskBodyId,
}) {
  if (!visible || generatedWarnings.length === 0) {
    return null;
  }

  const distanceLineWarningKeys = new Set();
  const hasFocusedRiskBody = Boolean(focusedRiskBodyId);
  let distanceLineCount = 0;

  generatedWarnings.forEach((warning, index) => {
    if (
      !shouldShowWarningDistanceLine(warning, focusedRiskBodyId) ||
      (!hasFocusedRiskBody && distanceLineCount >= 3)
    ) {
      return;
    }

    distanceLineWarningKeys.add(getWarningKey(warning, index));
    distanceLineCount += 1;
  });

  return (
    <>
      {generatedWarnings.map((warning, index) => {
        const workingFace = workingFaces.find(
          (face) => face.id === warning.workingFaceId
        );
        const riskBody = riskBodies.find(
          (body) => body.id === warning.riskBodyId
        );
        const warningKey = getWarningKey(warning, index);

        if (!workingFace || !riskBody) {
          return null;
        }

        const warningColor = getRiskColor(riskBody, warning);
        const showDistanceLine = distanceLineWarningKeys.has(warningKey);
        const workingFaceAdvanceDistance =
          workingFace.id === advancingWorkingFaceId
            ? advanceDistance
            : workingFace.currentAdvance;
        const movedWorkingFace = buildMovedWorkingFace(
          workingFace,
          workingFaceAdvanceDistance
        );

        return (
          <group key={warningKey}>
            <WarningMarker body={riskBody} color={warningColor} />
            {showDistanceLine && movedWorkingFace && (
              <DistanceLine
                from={movedWorkingFace}
                to={riskBody}
                color={warningColor}
                distance={warning.distance}
              />
            )}
          </group>
        );
      })}
    </>
  );
}
