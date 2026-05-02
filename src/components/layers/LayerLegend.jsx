export default function LayerLegend({ color, label }) {
  return (
    <span
      className="inline-flex h-3 w-3 shrink-0 border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.08)]"
      style={{ background: color }}
      aria-label={`${label}颜色图例`}
    />
  );
}
