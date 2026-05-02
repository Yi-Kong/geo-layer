import GoafWaterArea from "../risk/GoafWaterArea";

export default function GoafWaterLayer({ items = [], opacity = 0.48 }) {
  return (
    <>
      {items.map((area) => (
        <GoafWaterArea key={area.id} area={area} opacity={opacity} />
      ))}
    </>
  );
}
