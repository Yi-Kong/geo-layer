import { Canvas } from "@react-three/fiber";
import {
  Center,
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
} from "@react-three/drei";
import GeoLayerModel from "./GeoLayerModel";

export default function GeoScene({
  layerData,
  visibleLayerIds,
  explode,
  selectedLayerId,
  loading,
  loadError,
  onSelectLayer,
}) {
  return (
    <Canvas
      camera={{ position: [6.4, 4.2, 6.2], fov: 38, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#f4f1eb"]} />

      <ambientLight intensity={1.45} />
      <directionalLight position={[5, 8, 6]} intensity={2.1} />
      <directionalLight position={[-4, 5, -3]} intensity={0.6} />

      <Center>
        {!loading && !loadError && layerData.length > 0 && (
          <GeoLayerModel
            layerData={layerData}
            visibleLayerIds={visibleLayerIds}
            explode={explode}
            selectedLayerId={selectedLayerId}
            onSelectLayer={onSelectLayer}
          />
        )}
      </Center>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={5}
        maxDistance={16}
      />

      <GizmoHelper alignment="bottom-left" margin={[70, 70]}>
        <GizmoViewport
          axisColors={["#e8593f", "#4caf50", "#3f51e8"]}
          labelColor="black"
        />
      </GizmoHelper>
    </Canvas>
  );
}
