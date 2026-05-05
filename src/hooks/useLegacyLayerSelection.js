import { useCallback } from "react";

function toLegacyLayerSelectionObject(layer) {
  return {
    ...layer,
    type: "legacy_stratum",
    code: `LEGACY-${layer.id}`,
    properties: {
      lithology: layer.lithology,
      age: layer.age,
      porosity: layer.porosity,
      permeability: layer.permeability,
      description: layer.description,
    },
  };
}

export function useLegacyLayerSelection({
  layerData,
  setSelectedLayerId,
  setSelectedObject,
  clearSelectedRiskBody,
}) {
  return useCallback(
    (layerId) => {
      setSelectedLayerId(layerId);
      clearSelectedRiskBody();

      const layer = layerData.find((item) => item.id === layerId);

      if (layer) {
        setSelectedObject(toLegacyLayerSelectionObject(layer));
      }
    },
    [clearSelectedRiskBody, layerData, setSelectedLayerId, setSelectedObject]
  );
}
