import WorkingFace from "./WorkingFace";

function getDefaultWorkingFaceId(items) {
  return (
    items.find(
      (face) =>
        face.status === "mining" ||
        face.stage === "active" ||
        face.stage === "mining"
    )?.id ||
    items[0]?.id ||
    ""
  );
}

export default function WorkingFaceLayer({
  items = [],
  advanceDistance = 0,
  selectedWorkingFaceId = "",
  opacity = 0.72,
  onSelectWorkingFace,
}) {
  const hasSelectedWorkingFace = items.some(
    (face) => face.id === selectedWorkingFaceId
  );
  const advancingWorkingFaceId = hasSelectedWorkingFace
    ? selectedWorkingFaceId
    : getDefaultWorkingFaceId(items);

  return (
    <>
      {items.map((face) => (
        <WorkingFace
          key={face.id}
          face={face}
          advanceDistance={
            face.id === advancingWorkingFaceId
              ? advanceDistance
              : face.currentAdvance
          }
          opacity={opacity}
          onSelectWorkingFace={onSelectWorkingFace}
        />
      ))}
    </>
  );
}
