import PointFeatureLayer from "../scene/PointFeatureLayer";

export default function GasMeasurePointLayer({
  contentPoints = [],
  pressurePoints = [],
  contentOpacity = 0.92,
  pressureOpacity = 0.92,
}) {
  return (
    <>
      <PointFeatureLayer
        items={contentPoints}
        color="#FDBA74"
        opacity={contentOpacity}
        radius={6}
      />
      <PointFeatureLayer
        items={pressurePoints}
        color="#FB7185"
        opacity={pressureOpacity}
        radius={7}
      />
    </>
  );
}
