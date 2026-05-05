import { create } from "zustand";

export type PaintTool = "pencil" | "line" | "fill" | "erase";

interface PaintStore {
  selectedColor: string;
  toolMode: PaintTool;
  setSelectedColor: (color: string) => void;
  setToolMode: (toolMode: PaintTool) => void;
}

export const usePaintStore = create<PaintStore>((set) => ({
  selectedColor: "#000000",
  toolMode: "pencil",
  setSelectedColor: (selectedColor) => set({ selectedColor }),
  setToolMode: (toolMode) => set({ toolMode }),
}));
