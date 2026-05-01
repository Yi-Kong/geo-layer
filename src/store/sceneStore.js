import { create } from "zustand";

export const useSceneStore = create((set) => ({
  selectedObject: null,
  setSelectedObject: (object) => set({ selectedObject: object }),
  clearSelectedObject: () => set({ selectedObject: null }),
}));
