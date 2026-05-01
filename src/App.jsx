import GeoScene from "./components/geo3d/GeoScene";
import Header from "./components/Header";
import LayerControls from "./components/LayerControls";
import LayerInfoPanel from "./components/LayerInfoPanel";
import { useLayerControl } from "./hooks/useLayerControl";

export default function App() {
  const {
    layerData,
    visibleLayerIds,
    selectedLayerId,
    selectedLayer,
    explode,
    loading,
    loadError,
    setExplode,
    setSelectedLayerId,
    toggleLayerVisible,
    showAllLayers,
    hideAllLayers,
  } = useLayerControl();

  return (
    <div className="relative h-screen w-screen">
      <GeoScene
        layerData={layerData}
        visibleLayerIds={visibleLayerIds}
        explode={explode}
        selectedLayerId={selectedLayerId}
        loading={loading}
        loadError={loadError}
        onSelectLayer={setSelectedLayerId}
      />

      <div className="absolute right-6 top-6 max-h-[calc(100vh-48px)] w-[340px] overflow-auto rounded-xl border border-black/[0.08] bg-[#fffaf4]/95 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.08)] backdrop-blur-[8px]">
        <Header />

        {loading && <div className="state-text">正在加载地层数据...</div>}

        {loadError && <div className="error-text">{loadError}</div>}

        {!loading && !loadError && (
          <>
            <LayerControls
              explode={explode}
              layers={layerData}
              selectedLayerId={selectedLayerId}
              visibleLayerIds={visibleLayerIds}
              onExplodeChange={setExplode}
              onHideAllLayers={hideAllLayers}
              onSelectLayer={setSelectedLayerId}
              onShowAllLayers={showAllLayers}
              onToggleLayerVisible={toggleLayerVisible}
            />

            <LayerInfoPanel layer={selectedLayer} />
          </>
        )}
      </div>
    </div>
  );
}
