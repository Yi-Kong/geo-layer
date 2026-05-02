import { create } from "zustand";

export const useSelectionStore = create((set) => ({
  selectedObject: null,
  selectObject: (object) => set({ selectedObject: object }),
  clearSelection: () => set({ selectedObject: null }),
  setSelectedObject: (object) => set({ selectedObject: object }),
  clearSelectedObject: () => set({ selectedObject: null }),
}));
