import BoreholeLayer from "../../geology/BoreholeLayer";
import HiddenHazardLayer from "../../geology/HiddenHazardLayer";

export default function HiddenHazardLayerGroup({
  layers = {},
  opacities = {},
  smallMineDamageAreas = [],
  goafAreas = [],
  abandonedShafts = [],
  poorSealedBoreholes = [],
  faultInfluenceZones = [],
}) {
  return (
    <>
      {layers.smallMineDamageAreas && (
        <HiddenHazardLayer
          items={smallMineDamageAreas}
          opacity={opacities.smallMineDamageAreas}
        />
      )}

      {layers.goafAreas && (
        <HiddenHazardLayer items={goafAreas} opacity={opacities.goafAreas} />
      )}

      {layers.abandonedShafts && (
        <BoreholeLayer
          items={abandonedShafts}
          opacity={opacities.abandonedShafts}
          color="#FDE68A"
          radius={5}
        />
      )}

      {layers.poorSealedBoreholes && (
        <BoreholeLayer
          items={poorSealedBoreholes}
          opacity={opacities.poorSealedBoreholes}
          color="#FBBF24"
          radius={4}
        />
      )}

      {layers.faultInfluenceZones && (
        <HiddenHazardLayer
          items={faultInfluenceZones}
          opacity={opacities.faultInfluenceZones}
        />
      )}
    </>
  );
}
