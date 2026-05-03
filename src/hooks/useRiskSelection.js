import { useCallback, useMemo, useState } from "react";

function isRiskBodyObject(object, riskBodies = []) {
  if (!object?.id || object.type === "working_face") {
    return false;
  }

  if (riskBodies.some((item) => item.id === object.id)) {
    return true;
  }

  return Boolean(
    object.riskType ||
      object.type === "goaf_water_area" ||
      object.type === "water_rich_area" ||
      object.type === "gas_rich_area" ||
      object.type === "small_mine_damage_area" ||
      object.type === "goaf_area" ||
      object.type === "fault_influence_zone" ||
      object.type === "abandoned_shaft" ||
      object.type === "poor_sealed_borehole"
  );
}

export function useRiskSelection({
  riskBodies = [],
  selectedObject,
  setSelectedObject,
}) {
  const [selectedRiskBodyId, setSelectedRiskBodyId] = useState(null);

  const selectedRiskBody = useMemo(() => {
    if (!selectedObject?.id) {
      return null;
    }

    return (
      riskBodies.find((item) => item.id === selectedObject.id) ||
      (isRiskBodyObject(selectedObject, riskBodies) ? selectedObject : null)
    );
  }, [riskBodies, selectedObject]);
  const effectiveSelectedRiskBodyId =
    selectedRiskBody?.id || (selectedObject ? null : selectedRiskBodyId);

  const clearSelectedRiskBody = useCallback(() => {
    setSelectedRiskBodyId(null);
  }, []);

  const handleSelectWarning = useCallback((warning) => {
    setSelectedRiskBodyId(warning?.riskBodyId || null);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedRiskBodyId(null);
    setSelectedObject(null);
  }, [setSelectedObject]);

  const handleSelectRiskBody = useCallback(
    (riskBodyId) => {
      setSelectedRiskBodyId(riskBodyId || null);

      const riskBody = riskBodies.find((item) => item.id === riskBodyId);

      if (riskBody) {
        setSelectedObject(riskBody);
      }
    },
    [riskBodies, setSelectedObject]
  );

  return {
    selectedRiskBody,
    selectedRiskBodyId,
    effectiveSelectedRiskBodyId,
    clearSelectedRiskBody,
    handleSelectWarning,
    handleClearSelection,
    handleSelectRiskBody,
  };
}
