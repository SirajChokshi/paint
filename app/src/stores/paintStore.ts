import { create } from "zustand";

interface PaintStore {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
}

export const usePaintStore = create<PaintStore>((set) => ({
  selectedColor: "#000000",
  setSelectedColor: (selectedColor) => set({ selectedColor }),
}));
