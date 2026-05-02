import WaterRichArea from "../risk/WaterRichArea";

export default function WaterRichLayer({ items = [], opacity = 0.34 }) {
  return (
    <>
      {items.map((area) => (
        <WaterRichArea key={area.id} area={area} opacity={opacity} />
      ))}
    </>
  );
}
