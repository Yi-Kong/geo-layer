import { useEffect, useMemo, useState } from "react";
import { LAYER_DATA_URL } from "../data/layers";

export function useLayerControl() {
  const [layerData, setLayerData] = useState([]);
  const [visibleLayerIds, setVisibleLayerIds] = useState(new Set());
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [explode, setExplode] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadLayerData() {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch(LAYER_DATA_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`地层数据加载失败：${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("地层数据格式错误：根节点必须是数组。");
        }

        setLayerData(data);
        setVisibleLayerIds(new Set(data.map((item) => item.id)));
        setSelectedLayerId(data[0]?.id ?? null);
      } catch (error) {
        if (error.name !== "AbortError") {
          setLoadError(error.message || "地层数据加载失败");
        }
      } finally {
        setLoading(false);
      }
    }

    loadLayerData();

    return () => {
      controller.abort();
    };
  }, []);

  const selectedLayer = useMemo(() => {
    return layerData.find((layer) => layer.id === selectedLayerId) ?? null;
  }, [layerData, selectedLayerId]);

  function toggleLayerVisible(layerId) {
    const next = new Set(visibleLayerIds);

    if (next.has(layerId)) {
      next.delete(layerId);
    } else {
      next.add(layerId);
    }

    setVisibleLayerIds(next);

    if (selectedLayerId === layerId && !next.has(layerId)) {
      const nextSelected = layerData.find((layer) => next.has(layer.id));
      setSelectedLayerId(nextSelected?.id ?? null);
    }
  }

  function showAllLayers() {
    setVisibleLayerIds(new Set(layerData.map((layer) => layer.id)));

    if (!selectedLayerId && layerData.length > 0) {
      setSelectedLayerId(layerData[0].id);
    }
  }

  function hideAllLayers() {
    setVisibleLayerIds(new Set());
    setSelectedLayerId(null);
  }

  return {
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
  };
}
