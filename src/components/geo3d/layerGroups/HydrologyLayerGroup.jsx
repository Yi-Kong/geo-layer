import AquiferLayer from "../../hydrology/AquiferLayer";
import GoafWaterLayer from "../../hydrology/GoafWaterLayer";
import WaterInrushPointLayer from "../../hydrology/WaterInrushPointLayer";
import WaterRichLayer from "../../hydrology/WaterRichLayer";

export default function HydrologyLayerGroup({
  layers = {},
  opacities = {},
  aquifers = [],
  goafWaterAreas = [],
  waterRichAreas = [],
  waterInrushPoints = [],
}) {
  return (
    <>
      {layers.aquifers && (
        <AquiferLayer items={aquifers} opacity={opacities.aquifers} />
      )}

      {layers.goafWaterAreas && (
        <GoafWaterLayer
          items={goafWaterAreas}
          opacity={opacities.goafWaterAreas}
        />
      )}

      {layers.waterRichAreas && (
        <WaterRichLayer
          items={waterRichAreas}
          opacity={opacities.waterRichAreas}
        />
      )}

      {layers.waterInrushPoints && (
        <WaterInrushPointLayer
          items={waterInrushPoints}
          opacity={opacities.waterInrushPoints}
        />
      )}
    </>
  );
}
