import VolumeFeatureLayer from "../scene/VolumeFeatureLayer";

export default function SoftLayer({ items = [], opacity = 0.42 }) {
  return <VolumeFeatureLayer items={items} color="#D97706" opacity={opacity} />;
}
