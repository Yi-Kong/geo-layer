import VolumeFeatureLayer from "../scene/VolumeFeatureLayer";

export default function RiskRangeLayer({ items = [], opacity = 0.24 }) {
  return <VolumeFeatureLayer items={items} color="#F4A261" opacity={opacity} />;
}
