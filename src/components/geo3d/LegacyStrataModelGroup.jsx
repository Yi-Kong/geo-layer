import GeoLayerModel from "./GeoLayerModel";

export default function LegacyStrataModelGroup({
  layerData = [],
  visibleLayerIds = [],
  explode = 0,
  selectedLayerId,
  onSelectLayer,
  opacity = 1,
}) {
  if (!Array.isArray(layerData) || layerData.length === 0) {
    return null;
  }

  return (
    <group position={[0, 112, 0]} scale={[42, 32, 42]}>
      <GeoLayerModel
        layerData={layerData}
        visibleLayerIds={visibleLayerIds}
        explode={explode}
        selectedLayerId={selectedLayerId}
        onSelectLayer={onSelectLayer}
        opacity={opacity}
      />
    </group>
  );
}
