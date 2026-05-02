import PathFeatureLayer from "../scene/PathFeatureLayer";

export default function TunnelLayer({ items = [], opacity = 0.86 }) {
  return (
    <PathFeatureLayer
      items={items}
      color="#94A3B8"
      opacity={opacity}
      radius={3.4}
    />
  );
}
