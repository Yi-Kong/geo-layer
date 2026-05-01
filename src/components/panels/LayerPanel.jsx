import { useLayerStore } from "../../store/layerStore";

const LAYER_OPTIONS = [
  { key: "strata", label: "地层", color: "#94a3b8" },
  { key: "coalSeams", label: "煤层", color: "#0f172a" },
  { key: "workingFaces", label: "工作面", color: "#38bdf8" },
  { key: "goafWaterAreas", label: "采空积水区", color: "#2563eb" },
  { key: "waterRichAreas", label: "富水区", color: "#06b6d4" },
  { key: "gasRichAreas", label: "瓦斯富集区", color: "#f97316" },
  { key: "warnings", label: "预警点", color: "#ef4444" },
];

export default function LayerPanel({
  mineInfo,
  explode,
  onExplodeChange,
  legacyLoading,
}) {
  const layers = useLayerStore((state) => state.layers);
  const opacities = useLayerStore((state) => state.opacities);
  const toggleLayer = useLayerStore((state) => state.toggleLayer);
  const setOpacity = useLayerStore((state) => state.setOpacity);

  function handleOpacityChange(layerName, event) {
    setOpacity(layerName, event.target.value);
  }

  function handleExplodeChange(event) {
    onExplodeChange(Number(event.target.value));
  }

  return (
    <aside className="fixed left-5 top-5 z-20 w-[300px] border border-white/10 bg-slate-950/82 p-4 text-slate-100 shadow-[0_18px_44px_rgba(0,0,0,0.36)] backdrop-blur-md max-lg:left-4 max-lg:max-h-[calc(100vh-190px)] max-lg:w-[280px] max-lg:overflow-auto">
      <div className="border-b border-white/10 pb-3">
        <div className="text-[15px] font-semibold text-cyan-100">
          煤矿透明地质图层
        </div>
        <div className="mt-2 text-xs leading-5 text-slate-400">
          <div>{mineInfo?.name}</div>
          <div>{mineInfo?.gasLevel} / {mineInfo?.hydrogeologyType}水文类型</div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {LAYER_OPTIONS.map((item) => (
          <div key={item.key} className="border-b border-white/[0.06] pb-3 last:border-b-0 last:pb-0">
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                className="h-4 w-4 cursor-pointer accent-cyan-300"
                type="checkbox"
                checked={layers[item.key]}
                onChange={() => toggleLayer(item.key)}
              />
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: item.color }}
              />
              <span className="flex-1">{item.label}</span>
            </label>

            {item.key !== "warnings" && (
              <div className="mt-2 flex items-center gap-2 pl-7">
                <span className="w-8 text-[11px] text-slate-500">透明</span>
                <input
                  className="h-1.5 flex-1 cursor-pointer accent-cyan-300"
                  type="range"
                  min="0.12"
                  max="1"
                  step="0.01"
                  value={opacities[item.key]}
                  onChange={(event) => handleOpacityChange(item.key, event)}
                  onInput={(event) => handleOpacityChange(item.key, event)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {typeof explode === "number" && (
        <div className="mt-4 border-t border-white/10 pt-3">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>原地层拆分</span>
            <span>{legacyLoading ? "加载中" : explode.toFixed(2)}</span>
          </div>
          <input
            className="h-1.5 w-full cursor-pointer accent-cyan-300"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explode}
            onChange={handleExplodeChange}
            onInput={handleExplodeChange}
          />
        </div>
      )}
    </aside>
  );
}
