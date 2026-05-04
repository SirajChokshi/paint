import { create } from "zustand";

export interface Position {
  x: number;
  y: number;
}

interface WindowData {
  id: string;
  position: Position;
}

interface WindowStore {
  windows: WindowData[];
  addWindow: (window: WindowData) => void;
  removeWindow: (id: string) => void;
  getWindow: (id: string) => WindowData | undefined;
  touchWindow: (id: string) => void;
  getStackOrder: (id: string) => number;
  setWindowPosition: (id: string, position: Position) => void;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  addWindow: (window: WindowData) => {
    set((state) => ({ windows: [...state.windows, window] }));
  },
  removeWindow: (id: string) => {
    set((state) => ({
      windows: state.windows.filter((window) => window.id !== id),
    }));
  },
  getWindow: (id: string) => {
    return get().windows.find((window) => window.id === id);
  },
  touchWindow: (id: string) => {
    const window = get().getWindow(id);

    if (!window) return;

    set((state) => ({
      windows: [...state.windows.filter((window) => window.id !== id), window],
    }));
  },
  getStackOrder: (id: string) => {
    return get().windows.findIndex((window) => window.id === id);
  },

  setWindowPosition: (id: string, position: Position) => {
    const window = get().getWindow(id);

    if (!window) return;

    set((state) => ({
      windows: [
        ...state.windows.filter((window) => window.id !== id),
        {
          ...window,
          position,
        },
      ],
    }));
  },
}));
