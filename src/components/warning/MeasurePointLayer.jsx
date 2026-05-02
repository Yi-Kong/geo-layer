import PointFeatureLayer from "../scene/PointFeatureLayer";

export default function MeasurePointLayer({ items = [], opacity = 0.95 }) {
  return (
    <PointFeatureLayer
      items={items}
      color="#2A9D8F"
      opacity={opacity}
      radius={7}
    />
  );
}
