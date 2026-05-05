import GasMeasurePointLayer from "../../gas/GasMeasurePointLayer";
import GasRichLayer from "../../gas/GasRichLayer";
import SoftLayer from "../../gas/SoftLayer";

export default function GasLayerGroup({
  layers = {},
  opacities = {},
  gasRichAreas = [],
  gasContentPoints = [],
  gasPressurePoints = [],
  softLayers = [],
}) {
  return (
    <>
      {layers.gasRichAreas && (
        <GasRichLayer items={gasRichAreas} opacity={opacities.gasRichAreas} />
      )}

      {(layers.gasContentPoints || layers.gasPressurePoints) && (
        <GasMeasurePointLayer
          contentPoints={layers.gasContentPoints ? gasContentPoints : []}
          pressurePoints={layers.gasPressurePoints ? gasPressurePoints : []}
          contentOpacity={opacities.gasContentPoints}
          pressureOpacity={opacities.gasPressurePoints}
        />
      )}

      {layers.softLayers && (
        <SoftLayer items={softLayers} opacity={opacities.softLayers} />
      )}
    </>
  );
}
