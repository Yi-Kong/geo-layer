import {
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
} from "@react-three/drei";

export default function SceneEnvironment() {
  return (
    <>
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
    </>
  );
}
