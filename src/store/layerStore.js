import { create } from "zustand";
import { layerDefinitions, layerGroups } from "../mock/layers.js";

function clampOpacity(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 1;
  }

  return Math.min(1, Math.max(0.05, numberValue));
}

const initialLayers = Object.fromEntries(
  layerDefinitions.map((layer) => [layer.id, layer.defaultVisible !== false])
);

const initialOpacities = Object.fromEntries(
  layerDefinitions.map((layer) => [layer.id, layer.opacity ?? 1])
);

function setGroupVisibility(state, groupId, visible) {
  const nextLayers = { ...state.layers };

  layerDefinitions
    .filter((layer) => layer.groupId === groupId)
    .forEach((layer) => {
      nextLayers[layer.id] = visible;
    });

  return nextLayers;
}

export const useLayerStore = create((set) => ({
  layerGroups,
  layerDefinitions,
  layers: initialLayers,
  opacities: initialOpacities,
  selectedLayerId: null,

  toggleLayer: (layerId) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layerId]: !state.layers[layerId],
      },
      selectedLayerId: layerId,
    })),

  setLayerVisible: (layerId, visible) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layerId]: Boolean(visible),
      },
      selectedLayerId: layerId,
    })),

  setLayerOpacity: (layerId, opacity) =>
    set((state) => ({
      opacities: {
        ...state.opacities,
        [layerId]: clampOpacity(opacity),
      },
      selectedLayerId: layerId,
    })),

  setOpacity: (layerId, opacity) =>
    set((state) => ({
      opacities: {
        ...state.opacities,
        [layerId]: clampOpacity(opacity),
      },
      selectedLayerId: layerId,
    })),

  showGroup: (groupId) =>
    set((state) => ({
      layers: setGroupVisibility(state, groupId, true),
    })),

  hideGroup: (groupId) =>
    set((state) => ({
      layers: setGroupVisibility(state, groupId, false),
    })),

  showAllLayers: () =>
    set(() => ({
      layers: Object.fromEntries(layerDefinitions.map((layer) => [layer.id, true])),
    })),

  hideAllLayers: () =>
    set(() => ({
      layers: Object.fromEntries(layerDefinitions.map((layer) => [layer.id, false])),
    })),

  selectLayer: (layerId) => set({ selectedLayerId: layerId }),
}));
