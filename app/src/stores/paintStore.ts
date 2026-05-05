import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_PAINT_PALETTE_ID,
  getPaintPaletteColor,
  getPaintPaletteColorIndex,
  getPaintPalette,
  PaintPaletteId,
} from "../lib/palette";
import { getStorageKey } from "./utils";

export type PaintTool = "pencil" | "line" | "fill" | "erase";

const PAINT_STORE_KEY = getStorageKey("paint");

interface PaintStore {
  selectedColor: string;
  selectedColorIndex: number;
  paletteId: PaintPaletteId;
  toolMode: PaintTool;
  setSelectedColor: (color: string) => void;
  setSelectedColorIndex: (colorIndex: number) => void;
  setPaletteId: (paletteId: PaintPaletteId) => void;
  setToolMode: (toolMode: PaintTool) => void;
}

export const usePaintStore = create<PaintStore>()(
  persist(
    (set) => ({
      selectedColor: "#000000",
      selectedColorIndex: 0,
      paletteId: DEFAULT_PAINT_PALETTE_ID,
      toolMode: "pencil",
      setSelectedColor: (selectedColor) =>
        set((state) => {
          const palette = getPaintPalette(state.paletteId);
          const selectedColorIndex = getPaintPaletteColorIndex(
            selectedColor,
            palette,
          );
          return {
            selectedColorIndex,
            selectedColor: palette[selectedColorIndex] ?? palette[0] ?? "#000000",
          };
        }),
      setSelectedColorIndex: (selectedColorIndex) =>
        set((state) => ({
          selectedColorIndex,
          selectedColor: getPaintPaletteColor(
            state.paletteId,
            selectedColorIndex,
          ),
        })),
      setPaletteId: (paletteId) =>
        set((state) => ({
          paletteId,
          selectedColor: getPaintPaletteColor(
            paletteId,
            state.selectedColorIndex,
          ),
        })),
      setToolMode: (toolMode) => set({ toolMode }),
    }),
    {
      name: PAINT_STORE_KEY,
      partialize: (state) => ({
        paletteId: state.paletteId,
        selectedColor: state.selectedColor,
        selectedColorIndex: state.selectedColorIndex,
      }),
    },
  ),
);
