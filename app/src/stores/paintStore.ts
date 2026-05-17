import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Palette } from "pixel-paint";
import { TRANSPARENT_COLOR } from "pixel-paint";
import {
  DEFAULT_PAINT_PALETTE_ID,
  getPaintPaletteColorIndex,
  getPaintPalette,
  type PaintPaletteId,
} from "../lib/palette";

export type PaintTool = "pencil" | "line" | "fill" | "erase";

export type BackgroundColor = typeof TRANSPARENT_COLOR | string;

export type ActiveColorSlot = "fg" | "bg";

const PAINT_STORE_KEY = "sirajchokshi$paint@paint";
const PAINT_STORE_VERSION = 1;

export interface PaintStore {
  foregroundColorIndex: number;
  backgroundColor: BackgroundColor;
  activeColorSlot: ActiveColorSlot;
  paletteId: PaintPaletteId;
  customPalette: Palette | null;
  toolMode: PaintTool;
  setForegroundColorIndex: (colorIndex: number) => void;
  setBackgroundColor: (color: BackgroundColor) => void;
  setBackgroundTransparent: () => void;
  setActiveColorSlot: (slot: ActiveColorSlot) => void;
  setPaletteColorIndex: (colorIndex: number) => void;
  setPaletteId: (paletteId: PaintPaletteId) => void;
  setCustomPalette: (palette: Palette) => void;
  setToolMode: (toolMode: PaintTool) => void;
}

export function getActivePaintPalette(
  state: Pick<PaintStore, "paletteId" | "customPalette">,
): Palette {
  return state.customPalette ?? getPaintPalette(state.paletteId);
}

export function getForegroundColor(
  state: Pick<
    PaintStore,
    "paletteId" | "customPalette" | "foregroundColorIndex"
  >,
): string {
  const palette = getActivePaintPalette(state);
  return palette[state.foregroundColorIndex] ?? palette[0] ?? "#000000";
}

export function getDrawColor(
  state: Pick<
    PaintStore,
    | "paletteId"
    | "customPalette"
    | "foregroundColorIndex"
    | "backgroundColor"
    | "toolMode"
  >,
): string {
  if (state.toolMode === "erase") {
    return state.backgroundColor;
  }

  return getForegroundColor(state);
}

interface PersistedPaintStoreV0 {
  selectedColor?: string;
  selectedColorIndex?: number;
  paletteId?: PaintPaletteId;
  customPalette?: Palette | null;
}

interface PersistedPaintStoreV1 {
  foregroundColorIndex?: number;
  backgroundColor?: BackgroundColor;
  activeColorSlot?: ActiveColorSlot;
  paletteId?: PaintPaletteId;
  customPalette?: Palette | null;
}

export const usePaintStore = create<PaintStore>()(
  persist(
    (set) => ({
      foregroundColorIndex: 0,
      backgroundColor: TRANSPARENT_COLOR,
      activeColorSlot: "fg",
      paletteId: DEFAULT_PAINT_PALETTE_ID,
      customPalette: null,
      toolMode: "pencil",
      setForegroundColorIndex: (foregroundColorIndex) =>
        set((state) => {
          const palette = getActivePaintPalette(state);
          const clampedIndex = Math.max(
            0,
            Math.min(foregroundColorIndex, palette.length - 1),
          );

          return { foregroundColorIndex: clampedIndex };
        }),
      setBackgroundColor: (backgroundColor) =>
        set((state) => {
          if (backgroundColor === TRANSPARENT_COLOR) {
            return { backgroundColor: TRANSPARENT_COLOR };
          }

          const palette = getActivePaintPalette(state);
          const normalized = getPaintPaletteColorIndex(backgroundColor, palette);
          return {
            backgroundColor: palette[normalized] ?? palette[0] ?? "#ffffff",
          };
        }),
      setBackgroundTransparent: () =>
        set({ backgroundColor: TRANSPARENT_COLOR }),
      setActiveColorSlot: (activeColorSlot) => set({ activeColorSlot }),
      setPaletteColorIndex: (colorIndex) =>
        set((state) => {
          const palette = getActivePaintPalette(state);
          const clampedIndex = Math.max(
            0,
            Math.min(colorIndex, palette.length - 1),
          );

          if (state.activeColorSlot === "bg") {
            return {
              backgroundColor: palette[clampedIndex] ?? palette[0] ?? "#ffffff",
            };
          }

          return { foregroundColorIndex: clampedIndex };
        }),
      setPaletteId: (paletteId) =>
        set((state) => ({
          paletteId,
          customPalette: null,
          foregroundColorIndex: Math.min(
            state.foregroundColorIndex,
            getPaintPalette(paletteId).length - 1,
          ),
        })),
      setCustomPalette: (customPalette) =>
        set((state) => ({
          customPalette,
          foregroundColorIndex: Math.min(
            state.foregroundColorIndex,
            customPalette.length - 1,
          ),
        })),
      setToolMode: (toolMode) => set({ toolMode }),
    }),
    {
      name: PAINT_STORE_KEY,
      version: PAINT_STORE_VERSION,
      migrate: (persistedState, version) => {
        if (version >= PAINT_STORE_VERSION) {
          return persistedState as PersistedPaintStoreV1;
        }

        const legacy = persistedState as PersistedPaintStoreV0;
        return {
          foregroundColorIndex: legacy.selectedColorIndex ?? 0,
          backgroundColor: TRANSPARENT_COLOR,
          activeColorSlot: "fg",
          paletteId: legacy.paletteId ?? DEFAULT_PAINT_PALETTE_ID,
          customPalette: legacy.customPalette ?? null,
        } satisfies PersistedPaintStoreV1;
      },
      partialize: (state) => ({
        foregroundColorIndex: state.foregroundColorIndex,
        backgroundColor: state.backgroundColor,
        activeColorSlot: state.activeColorSlot,
        paletteId: state.paletteId,
        customPalette: state.customPalette,
      }),
    },
  ),
);
