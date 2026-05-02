import LayerLegend from "./LayerLegend";

export default function LayerItem({
  layer,
  visible,
  opacity,
  selected,
  onToggle,
  onOpacityChange,
  onSelect,
}) {
  return (
    <div
      className={`border-l-2 px-2 py-2 transition ${
        selected
          ? "border-cyan-300 bg-cyan-300/[0.08]"
          : "border-transparent hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex items-start gap-2">
        <input
          className="mt-0.5 h-4 w-4 cursor-pointer accent-cyan-300"
          type="checkbox"
          checked={Boolean(visible)}
          onChange={(event) => onToggle(layer.id, event.target.checked)}
          aria-label={`切换${layer.name}`}
        />

        <button
          className="min-w-0 flex-1 cursor-pointer text-left"
          type="button"
          onClick={() => onSelect(layer.id)}
        >
          <div className="flex min-w-0 items-center gap-2">
            <LayerLegend color={layer.color} label={layer.name} />
            <span className="truncate text-[13px] font-medium text-slate-100">
              {layer.name}
            </span>
            <span className="ml-auto shrink-0 text-[11px] text-slate-500">
              {layer.count} 个
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">
            {layer.description}
          </p>
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2 pl-6">
        <span className="w-8 text-[11px] text-slate-500">透明</span>
        <input
          className="h-1.5 min-w-0 flex-1 cursor-pointer accent-cyan-300"
          type="range"
          min="0.05"
          max="1"
          step="0.01"
          value={opacity}
          onChange={(event) => onOpacityChange(layer.id, event.target.value)}
          onInput={(event) => onOpacityChange(layer.id, event.target.value)}
          aria-label={`${layer.name}透明度`}
        />
        <span className="w-9 text-right text-[11px] text-slate-400">
          {Math.round(opacity * 100)}%
        </span>
      </div>
    </div>
  );
}
