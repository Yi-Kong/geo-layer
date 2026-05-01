import { Canvas } from "@react-three/fiber";
import {
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
} from "@react-three/drei";
import GeoLayerModel from "./GeoLayerModel";
import CoalSeam from "../geology/CoalSeam";
import StrataLayer from "../geology/StrataLayer";
import DistanceLine from "../mining/DistanceLine";
import WorkingFace from "../mining/WorkingFace";
import GasRichArea from "../risk/GasRichArea";
import GoafWaterArea from "../risk/GoafWaterArea";
import WaterRichArea from "../risk/WaterRichArea";
import { useLayerStore } from "../../store/layerStore";
import { getCenter, moveBoundary } from "../../utils/distance";

function WarningMarker({ body, color }) {
  const center = getCenter(body.points);

  return (
    <mesh position={[center[0], center[1] + 10, center[2]]}>
      <sphereGeometry args={[8, 18, 18]} />
      <meshBasicMaterial color={color} transparent opacity={0.92} />
    </mesh>
  );
}

export default function GeoScene({
  layerData,
  visibleLayerIds,
  explode,
  selectedLayerId,
  onSelectLayer,
  strata = [],
  coalSeams = [],
  workingFaces = [],
  goafWaterAreas = [],
  waterRichAreas = [],
  gasRichAreas = [],
  warnings = [],
  advanceDistance = 0,
}) {
  const layers = useLayerStore((state) => state.layers);
  const opacities = useLayerStore((state) => state.opacities);
  const riskBodies = [...goafWaterAreas, ...waterRichAreas, ...gasRichAreas];

  return (
    <Canvas
      camera={{ position: [430, 245, 430], fov: 42, near: 1, far: 1600 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#050910"]} />
      <fog attach="fog" args={["#050910", 560, 1220]} />

      <ambientLight intensity={0.74} />
      <directionalLight position={[280, 420, 220]} intensity={2.2} />
      <directionalLight position={[-280, 160, -220]} intensity={0.9} />
      <pointLight position={[0, 120, 0]} intensity={0.62} color="#38bdf8" />

      <gridHelper
        args={[760, 24, "#1e8fa6", "#152737"]}
        position={[0, -162, 0]}
      />

      <group rotation={[0, -0.24, 0]}>
        {layers.strata && (
          <>
            {strata.map((layer) => (
              <StrataLayer
                key={layer.id}
                layer={layer}
                opacity={opacities.strata}
              />
            ))}

            {layerData.length > 0 && (
              <group position={[0, 112, 0]} scale={[42, 32, 42]}>
                <GeoLayerModel
                  layerData={layerData}
                  visibleLayerIds={visibleLayerIds}
                  explode={explode}
                  selectedLayerId={selectedLayerId}
                  onSelectLayer={onSelectLayer}
                />
              </group>
            )}
          </>
        )}

        {layers.coalSeams &&
          coalSeams.map((seam) => (
            <CoalSeam key={seam.id} seam={seam} opacity={opacities.coalSeams} />
          ))}

        {layers.workingFaces &&
          workingFaces.map((face) => (
            <WorkingFace
              key={face.id}
              face={face}
              advanceDistance={advanceDistance}
              opacity={opacities.workingFaces}
            />
          ))}

        {layers.goafWaterAreas &&
          goafWaterAreas.map((area) => (
            <GoafWaterArea
              key={area.id}
              area={area}
              opacity={opacities.goafWaterAreas}
            />
          ))}

        {layers.waterRichAreas &&
          waterRichAreas.map((area) => (
            <WaterRichArea
              key={area.id}
              area={area}
              opacity={opacities.waterRichAreas}
            />
          ))}

        {layers.gasRichAreas &&
          gasRichAreas.map((area) => (
            <GasRichArea
              key={area.id}
              area={area}
              opacity={opacities.gasRichAreas}
            />
          ))}

        {layers.warnings &&
          warnings.map((warning) => {
            const workingFace = workingFaces.find(
              (face) => face.id === warning.workingFaceId
            );
            const riskBody = riskBodies.find(
              (body) => body.id === warning.riskBodyId
            );

            if (!workingFace || !riskBody) {
              return null;
            }

            return (
              <group key={warning.id}>
                <WarningMarker body={riskBody} color={warning.color} />
                <DistanceLine
                  from={{
                    ...workingFace,
                    boundary: moveBoundary(
                      workingFace.boundary,
                      workingFace.advanceDirection,
                      advanceDistance
                    ),
                  }}
                  to={riskBody}
                  color={warning.color}
                />
              </group>
            );
          })}
      </group>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        target={[20, -28, -16]}
        minDistance={130}
        maxDistance={920}
      />

      <GizmoHelper alignment="bottom-left" margin={[70, 70]}>
        <GizmoViewport
          axisColors={["#e8593f", "#4caf50", "#3f51e8"]}
          labelColor="white"
        />
      </GizmoHelper>
    </Canvas>
  );
}
