import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_PAINT_PALETTE_ID,
  getPaintPalette,
  PaintPaletteId,
  quantizeToPaintPalette,
} from "../lib/palette";
import { getStorageKey } from "./utils";

export type PaintTool = "pencil" | "line" | "fill" | "erase";

const PAINT_STORE_KEY = getStorageKey("paint");

interface PaintStore {
  selectedColor: string;
  paletteId: PaintPaletteId;
  toolMode: PaintTool;
  setSelectedColor: (color: string) => void;
  setPaletteId: (paletteId: PaintPaletteId) => void;
  setToolMode: (toolMode: PaintTool) => void;
}

export const usePaintStore = create<PaintStore>()(
  persist(
    (set) => ({
      selectedColor: "#000000",
      paletteId: DEFAULT_PAINT_PALETTE_ID,
      toolMode: "pencil",
      setSelectedColor: (selectedColor) => set({ selectedColor }),
      setPaletteId: (paletteId) =>
        set((state) => ({
          paletteId,
          selectedColor: quantizeToPaintPalette(
            state.selectedColor,
            getPaintPalette(paletteId),
          ),
        })),
      setToolMode: (toolMode) => set({ toolMode }),
    }),
    {
      name: PAINT_STORE_KEY,
      partialize: (state) => ({ paletteId: state.paletteId }),
    },
  ),
);
