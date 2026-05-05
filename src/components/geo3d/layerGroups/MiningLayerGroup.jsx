import MiningPathLayer from "../../mining/MiningPathLayer";
import TunnelLayer from "../../mining/TunnelLayer";
import WorkingFaceLayer from "../../mining/WorkingFaceLayer";

export default function MiningLayerGroup({
  layers = {},
  opacities = {},
  workingFaces = [],
  tunnels = [],
  miningPaths = [],
  advanceDistance = 0,
  advancingWorkingFaceId = "",
  onSelectWorkingFace,
}) {
  return (
    <>
      {layers.tunnels && (
        <TunnelLayer items={tunnels} opacity={opacities.tunnels} />
      )}

      {layers.workingFaces && (
        <WorkingFaceLayer
          items={workingFaces}
          advanceDistance={advanceDistance}
          selectedWorkingFaceId={advancingWorkingFaceId}
          opacity={opacities.workingFaces}
          onSelectWorkingFace={onSelectWorkingFace}
        />
      )}

      {layers.miningPaths && (
        <MiningPathLayer items={miningPaths} opacity={opacities.miningPaths} />
      )}
    </>
  );
}
