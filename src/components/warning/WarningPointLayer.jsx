import PointFeatureLayer from "../scene/PointFeatureLayer";

export default function WarningPointLayer({ items = [], opacity = 1 }) {
  return (
    <PointFeatureLayer
      items={items}
      color="#E63946"
      opacity={opacity}
      radius={8}
      animated
    />
  );
}
