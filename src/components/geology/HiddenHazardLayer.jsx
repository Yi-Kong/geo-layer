import VolumeFeatureLayer from "../scene/VolumeFeatureLayer";

export default function HiddenHazardLayer({ items = [], opacity = 0.38 }) {
  return <VolumeFeatureLayer items={items} opacity={opacity} />;
}
