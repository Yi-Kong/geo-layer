import PointFeatureLayer from "../scene/PointFeatureLayer";

export default function WaterInrushPointLayer({ items = [], opacity = 0.92 }) {
  return (
    <PointFeatureLayer
      items={items}
      color="#0EA5E9"
      opacity={opacity}
      radius={7}
      animated
    />
  );
}
