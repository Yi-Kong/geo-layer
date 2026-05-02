import CoalSeam from "./CoalSeam";

export default function CoalSeamLayer({ items = [], opacity = 0.76 }) {
  return (
    <>
      {items.map((seam) => (
        <CoalSeam key={seam.id} seam={seam} opacity={opacity} />
      ))}
    </>
  );
}
