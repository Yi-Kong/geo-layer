import MeasurePointLayer from "../../warning/MeasurePointLayer";
import RiskRangeLayer from "../../warning/RiskRangeLayer";
import WarningPointLayer from "../../warning/WarningPointLayer";

export default function WarningLayerGroup({
  layers = {},
  opacities = {},
  warningPoints = [],
  riskRanges = [],
  measurePoints = [],
}) {
  return (
    <>
      {layers.riskRanges && (
        <RiskRangeLayer items={riskRanges} opacity={opacities.riskRanges} />
      )}

      {layers.measures && (
        <MeasurePointLayer items={measurePoints} opacity={opacities.measures} />
      )}

      {layers.warnings &&
        warningPoints.length > 0 && (
          <WarningPointLayer
            items={warningPoints}
            opacity={opacities.warnings}
          />
        )}
    </>
  );
}
