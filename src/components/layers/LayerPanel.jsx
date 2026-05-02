import { useMemo, useState } from "react";
import { useLayerStore } from "../../store/layerStore";
import LayerGroup from "./LayerGroup";

function normalizeKeyword(value) {
  return value.trim().toLowerCase();
}

export default function LayerPanel({
  mineInfo,
  explode,
  onExplodeChange,
  legacyLoading,
}) {
  const [keyword, setKeyword] = useState("");
  const layerGroups = useLayerStore((state) => state.layerGroups);
  const layerDefinitions = useLayerStore((state) => state.layerDefinitions);
  const layers = useLayerStore((state) => state.layers);
  const opacities = useLayerStore((state) => state.opacities);
  const selectedLayerId = useLayerStore((state) => state.selectedLayerId);
  const setLayerVisible = useLayerStore((state) => state.setLayerVisible);
  const setLayerOpacity = useLayerStore((state) => state.setLayerOpacity);
  const showGroup = useLayerStore((state) => state.showGroup);
  const hideGroup = useLayerStore((state) => state.hideGroup);
  const showAllLayers = useLayerStore((state) => state.showAllLayers);
  const hideAllLayers = useLayerStore((state) => state.hideAllLayers);
  const selectLayer = useLayerStore((state) => state.selectLayer);

  const filteredLayerMap = useMemo(() => {
    const normalized = normalizeKeyword(keyword);

    return layerGroups.map((group) => ({
      ...group,
      layers: layerDefinitions.filter((layer) => {
        if (layer.groupId !== group.id) {
          return false;
        }

        if (!normalized) {
          return true;
        }

        return `${layer.name} ${layer.description}`.toLowerCase().includes(normalized);
      }),
    }));
  }, [keyword, layerDefinitions, layerGroups]);

  function handleExplodeChange(event) {
    onExplodeChange(Number(event.target.value));
  }

  return (
    <aside className="fixed left-5 top-[84px] z-20 flex max-h-[calc(100vh-108px)] w-[340px] flex-col border border-white/10 bg-slate-950/86 text-slate-100 shadow-[0_18px_44px_rgba(0,0,0,0.36)] backdrop-blur-md max-lg:left-4 max-lg:w-[300px]">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[15px] font-semibold text-cyan-100">
              统一图层控制
            </div>
            <div className="mt-2 text-xs leading-5 text-slate-400">
              <div>{mineInfo?.name}</div>
              <div>
                {mineInfo?.gasLevel} / {mineInfo?.hydrogeologyType}水文类型
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right text-[11px] text-slate-500">
            <div>{layerDefinitions.length} 图层</div>
            <div>{layerGroups.length} 分组</div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            className="flex-1 cursor-pointer border border-cyan-300/25 px-3 py-2 text-xs text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-300/10"
            type="button"
            onClick={showAllLayers}
          >
            全部图层打开
          </button>
          <button
            className="flex-1 cursor-pointer border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-white/30 hover:bg-white/[0.05]"
            type="button"
            onClick={hideAllLayers}
          >
            全部图层关闭
          </button>
        </div>

        <input
          className="mt-3 w-full border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/45"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜索图层名称或说明"
          type="search"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-4">
        {filteredLayerMap.map((group) => (
          <LayerGroup
            key={group.id}
            group={group}
            layers={group.layers}
            visibility={layers}
            opacities={opacities}
            selectedLayerId={selectedLayerId}
            onShowGroup={showGroup}
            onHideGroup={hideGroup}
            onToggleLayer={setLayerVisible}
            onOpacityChange={setLayerOpacity}
            onSelectLayer={selectLayer}
          />
        ))}
      </div>

      {typeof explode === "number" && (
        <div className="border-t border-white/10 p-4">
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
