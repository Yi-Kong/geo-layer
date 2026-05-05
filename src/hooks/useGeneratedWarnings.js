import { useEffect } from "react";
import { generateWarningsByAdvance } from "../services/warningService";
import { useWarningStore } from "../store/warningStore";

export function useGeneratedWarnings({
  workingFaces,
  riskBodies,
  advanceDistance,
  selectedWorkingFaceId,
}) {
  const setWarnings = useWarningStore((state) => state.setWarnings);
  const warnings = useWarningStore((state) => state.warnings);

  useEffect(() => {
    setWarnings(
      generateWarningsByAdvance(
        workingFaces,
        riskBodies,
        advanceDistance,
        selectedWorkingFaceId
      )
    );
  }, [
    advanceDistance,
    riskBodies,
    selectedWorkingFaceId,
    setWarnings,
    workingFaces,
  ]);

  return warnings;
}
