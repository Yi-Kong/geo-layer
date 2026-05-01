import { create } from "zustand";

export const useLayerStore = create((set) => ({
  layers: {
    strata: true,
    coalSeams: true,
    workingFaces: true,
    goafWaterAreas: true,
    waterRichAreas: true,
    gasRichAreas: true,
    warnings: true,
  },
  opacities: {
    strata: 0.38,
    coalSeams: 0.72,
    workingFaces: 0.72,
    goafWaterAreas: 0.48,
    waterRichAreas: 0.32,
    gasRichAreas: 0.44,
    warnings: 1,
  },
  toggleLayer: (layerName) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layerName]: !state.layers[layerName],
      },
    })),
  setLayerVisible: (layerName, visible) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layerName]: visible,
      },
    })),
  setOpacity: (layerName, value) =>
    set((state) => ({
      opacities: {
        ...state.opacities,
        [layerName]: Number(value),
      },
    })),
}));
