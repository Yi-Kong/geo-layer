import { create } from "zustand";
import { fetchLayerConfig } from "../api/geoApi";
import {
  layerDefinitions as fallbackLayerDefinitions,
  layerGroups as fallbackLayerGroups,
} from "../mock/layers.js";

function clampOpacity(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 1;
  }

  return Math.min(1, Math.max(0.05, numberValue));
}

const initialLayers = Object.fromEntries(
  fallbackLayerDefinitions.map((layer) => [
    layer.id,
    layer.defaultVisible !== false,
  ])
);

const initialOpacities = Object.fromEntries(
  fallbackLayerDefinitions.map((layer) => [layer.id, layer.opacity ?? 1])
);

function getLayerVisibility(layer, previousLayers = {}) {
  if (Object.prototype.hasOwnProperty.call(previousLayers, layer.id)) {
    return previousLayers[layer.id];
  }

  return layer.defaultVisible !== false;
}

function getLayerOpacity(layer, previousOpacities = {}) {
  if (Object.prototype.hasOwnProperty.call(previousOpacities, layer.id)) {
    return previousOpacities[layer.id];
  }

  return layer.opacity ?? 1;
}

function buildLayerVisibility(layerDefinitions, previousLayers) {
  return Object.fromEntries(
    layerDefinitions.map((layer) => [
      layer.id,
      getLayerVisibility(layer, previousLayers),
    ])
  );
}

function buildLayerOpacities(layerDefinitions, previousOpacities) {
  return Object.fromEntries(
    layerDefinitions.map((layer) => [
      layer.id,
      getLayerOpacity(layer, previousOpacities),
    ])
  );
}

function setGroupVisibility(state, groupId, visible) {
  const nextLayers = { ...state.layers };

  state.layerDefinitions
    .filter((layer) => layer.groupId === groupId)
    .forEach((layer) => {
      nextLayers[layer.id] = visible;
    });

  return nextLayers;
}

export const useLayerStore = create((set) => ({
  layerGroups: fallbackLayerGroups,
  layerDefinitions: fallbackLayerDefinitions,
  layers: initialLayers,
  opacities: initialOpacities,
  selectedLayerId: null,

  loadLayerConfig: async () => {
    try {
      const config = await fetchLayerConfig();
      const nextLayerGroups = Array.isArray(config?.layerGroups)
        ? config.layerGroups
        : fallbackLayerGroups;
      const nextLayerDefinitions = Array.isArray(config?.layerDefinitions)
        ? config.layerDefinitions
        : fallbackLayerDefinitions;

      set((state) => ({
        layerGroups: nextLayerGroups,
        layerDefinitions: nextLayerDefinitions,
        layers: buildLayerVisibility(nextLayerDefinitions, state.layers),
        opacities: buildLayerOpacities(nextLayerDefinitions, state.opacities),
      }));
    } catch (error) {
      console.error("Failed to load layer config:", error);
    }
  },

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
    set((state) => ({
      layers: Object.fromEntries(
        state.layerDefinitions.map((layer) => [layer.id, true])
      ),
    })),

  hideAllLayers: () =>
    set((state) => ({
      layers: Object.fromEntries(
        state.layerDefinitions.map((layer) => [layer.id, false])
      ),
    })),

  selectLayer: (layerId) => set({ selectedLayerId: layerId }),
}));
