import RiskBody from "../risk/RiskBody";

export default function VolumeFeatureLayer({ items = [], color, opacity = 0.4 }) {
  return (
    <>
      {items.map((item) => (
        <RiskBody
          key={item.id}
          body={item}
          color={item.color || color}
          opacity={opacity}
        />
      ))}
    </>
  );
}
