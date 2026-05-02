import WorkingFace from "./WorkingFace";

function isAdvancingFace(face) {
  return face.status === "mining" || face.stage === "active" || face.stage === "mining";
}

export default function WorkingFaceLayer({
  items = [],
  advanceDistance = 0,
  opacity = 0.72,
  onSelectWorkingFace,
}) {
  return (
    <>
      {items.map((face) => (
        <WorkingFace
          key={face.id}
          face={face}
          advanceDistance={isAdvancingFace(face) ? advanceDistance : face.currentAdvance}
          opacity={opacity}
          onSelectWorkingFace={onSelectWorkingFace}
        />
      ))}
    </>
  );
}
