import { create } from "zustand";

export const useWarningStore = create((set) => ({
  warnings: [],
  setWarnings: (warnings) => set({ warnings }),
  clearWarnings: () => set({ warnings: [] }),
  updateWarningStatus: (id, status) =>
    set((state) => ({
      warnings: state.warnings.map((warning) =>
        warning.id === id ? { ...warning, status } : warning
      ),
    })),
}));
