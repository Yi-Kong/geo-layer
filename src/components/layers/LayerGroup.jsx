import LayerItem from "./LayerItem";

export default function LayerGroup({
  group,
  layers,
  visibility,
  opacities,
  selectedLayerId,
  onShowGroup,
  onHideGroup,
  onToggleLayer,
  onOpacityChange,
  onSelectLayer,
}) {
  if (layers.length === 0) {
    return null;
  }

  const visibleCount = layers.filter((layer) => visibility[layer.id]).length;

  return (
    <section className="border-b border-white/[0.07] py-3 last:border-b-0">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-semibold text-cyan-100">
              {group.name}
            </h3>
            <span className="text-[11px] text-slate-500">
              {visibleCount}/{layers.length}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">
            {group.description}
          </p>
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            className="cursor-pointer border border-cyan-300/20 px-2 py-1 text-[11px] text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/10"
            type="button"
            onClick={() => onShowGroup(group.id)}
          >
            全开
          </button>
          <button
            className="cursor-pointer border border-white/10 px-2 py-1 text-[11px] text-slate-300 transition hover:border-white/30 hover:bg-white/[0.05]"
            type="button"
            onClick={() => onHideGroup(group.id)}
          >
            全关
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {layers.map((layer) => (
          <LayerItem
            key={layer.id}
            layer={layer}
            visible={visibility[layer.id]}
            opacity={opacities[layer.id] ?? layer.opacity ?? 1}
            selected={selectedLayerId === layer.id}
            onToggle={onToggleLayer}
            onOpacityChange={onOpacityChange}
            onSelect={onSelectLayer}
          />
        ))}
      </div>
    </section>
  );
}
