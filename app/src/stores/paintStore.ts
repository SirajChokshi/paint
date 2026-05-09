import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Palette } from "pixel-paint";
import {
  DEFAULT_PAINT_PALETTE_ID,
  getPaintPaletteColor,
  getPaintPaletteColorIndex,
  getPaintPalette,
  type PaintPaletteId,
} from "../lib/palette";

export type PaintTool = "pencil" | "line" | "fill" | "erase";

const PAINT_STORE_KEY = "sirajchokshi$paint@paint";

export interface PaintStore {
  selectedColor: string;
  selectedColorIndex: number;
  paletteId: PaintPaletteId;
  customPalette: Palette | null;
  toolMode: PaintTool;
  setSelectedColor: (color: string) => void;
  setSelectedColorIndex: (colorIndex: number) => void;
  setPaletteId: (paletteId: PaintPaletteId) => void;
  setCustomPalette: (palette: Palette) => void;
  setToolMode: (toolMode: PaintTool) => void;
}

export function getActivePaintPalette(
  state: Pick<PaintStore, "paletteId" | "customPalette">,
): Palette {
  return state.customPalette ?? getPaintPalette(state.paletteId);
}

export const usePaintStore = create<PaintStore>()(
  persist(
    (set) => ({
      selectedColor: "#000000",
      selectedColorIndex: 0,
      paletteId: DEFAULT_PAINT_PALETTE_ID,
      customPalette: null,
      toolMode: "pencil",
      setSelectedColor: (selectedColor) =>
        set((state) => {
          const palette = getActivePaintPalette(state);
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
        set((state) => {
          const palette = getActivePaintPalette(state);

          return {
            selectedColorIndex,
            selectedColor: palette[selectedColorIndex] ?? palette[0] ?? "#000000",
          };
        }),
      setPaletteId: (paletteId) =>
        set((state) => ({
          paletteId,
          customPalette: null,
          selectedColor: getPaintPaletteColor(
            paletteId,
            state.selectedColorIndex,
          ),
        })),
      setCustomPalette: (customPalette) =>
        set((state) => ({
          customPalette,
          selectedColor:
            customPalette[state.selectedColorIndex] ??
            customPalette[0] ??
            "#000000",
        })),
      setToolMode: (toolMode) => set({ toolMode }),
    }),
    {
      name: PAINT_STORE_KEY,
      partialize: (state) => ({
        paletteId: state.paletteId,
        customPalette: state.customPalette,
        selectedColor: state.selectedColor,
        selectedColorIndex: state.selectedColorIndex,
      }),
    },
  ),
);
