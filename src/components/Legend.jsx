const sizeClassNames = {
  default: "h-[14px] w-[14px]",
  small: "h-[10px] w-[10px]",
};

export default function Legend({ color, size = "default" }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full border border-black/[0.12] ${
        sizeClassNames[size] ?? sizeClassNames.default
      }`}
      style={{ background: color }}
    />
  );
}
