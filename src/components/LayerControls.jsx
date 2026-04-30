import Legend from "./Legend";

export default function LayerControls({
  explode,
  layers,
  selectedLayerId,
  visibleLayerIds,
  onExplodeChange,
  onHideAllLayers,
  onSelectLayer,
  onShowAllLayers,
  onToggleLayerVisible,
}) {
  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm text-[#555]">拆分程度</label>
        <div className="text-[13px] font-bold text-[#1f6581]">
          {explode.toFixed(2)}
        </div>
      </div>

      <input
        className="mb-2.5 w-full cursor-pointer"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={explode}
        onChange={(e) => onExplodeChange(Number(e.target.value))}
      />

      <div className="text-xs leading-[1.6] text-[#777]">
        拖动滑块可拆分地质层；鼠标悬停在某层上可查看简要信息；点击某层可查看详细信息。
      </div>

      <div className="my-[14px] h-px bg-black/[0.08]" />

      <div className="mb-2.5 text-sm font-bold text-[#3d3d3d]">
        地层显示 / 隐藏
      </div>

      <div className="mb-2.5 flex gap-2">
        <button
          className="flex-1 cursor-pointer rounded-lg border border-[rgba(31,101,129,0.25)] bg-white px-2.5 py-[7px] text-[13px] text-[#1f6581] hover:bg-[#eef7fb]"
          onClick={onShowAllLayers}
        >
          全部显示
        </button>
        <button
          className="flex-1 cursor-pointer rounded-lg border border-[rgba(31,101,129,0.25)] bg-white px-2.5 py-[7px] text-[13px] text-[#1f6581] hover:bg-[#eef7fb]"
          onClick={onHideAllLayers}
        >
          全部隐藏
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {layers.map((layer) => {
          const visible = visibleLayerIds.has(layer.id);
          const selected = selectedLayerId === layer.id;

          return (
            <div
              key={layer.id}
              className={`flex w-full items-center gap-2 rounded-lg border px-2 py-[7px] transition-all duration-200 ease-in-out hover:border-[rgba(31,101,129,0.28)] hover:bg-[#f7fbfd] ${
                selected
                  ? "border-[rgba(31,101,129,0.45)] bg-[#eef7fb]"
                  : "border-black/[0.08] bg-white"
              } ${visible ? "" : "opacity-[0.48]"}`}
            >
              <input
                className="cursor-pointer"
                type="checkbox"
                checked={visible}
                onChange={() => onToggleLayerVisible(layer.id)}
              />

              <button
                className="flex flex-1 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left text-[13px] text-[#333] disabled:cursor-not-allowed disabled:text-[#999]"
                disabled={!visible}
                onClick={() => onSelectLayer(layer.id)}
              >
                <Legend color={layer.color} size="small" />
                <span>{layer.name}</span>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
