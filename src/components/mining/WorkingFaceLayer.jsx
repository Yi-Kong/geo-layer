import WorkingFace from "./WorkingFace";

export default function WorkingFaceLayer({
  items = [],
  advanceDistance = 0,
  opacity = 0.72,
}) {
  return (
    <>
      {items.map((face) => (
        <WorkingFace
          key={face.id}
          face={face}
          advanceDistance={
            face.status === "mining" ? advanceDistance : face.currentAdvance
          }
          opacity={opacity}
        />
      ))}
    </>
  );
}
