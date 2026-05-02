import GasRichArea from "../risk/GasRichArea";

export default function GasRichLayer({ items = [], opacity = 0.44 }) {
  return (
    <>
      {items.map((area) => (
        <GasRichArea key={area.id} area={area} opacity={opacity} />
      ))}
    </>
  );
}
