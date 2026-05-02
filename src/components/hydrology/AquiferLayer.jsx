import VolumeFeatureLayer from "../scene/VolumeFeatureLayer";

export default function AquiferLayer({ items = [], opacity = 0.22 }) {
  return <VolumeFeatureLayer items={items} color="#38BDF8" opacity={opacity} />;
}
