import PathFeatureLayer from "../scene/PathFeatureLayer";

export default function MiningPathLayer({ items = [], opacity = 0.9 }) {
  return (
    <PathFeatureLayer
      items={items}
      color="#4ADE80"
      opacity={opacity}
      radius={2}
      showArrow
    />
  );
}
