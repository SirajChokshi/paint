import { create } from "zustand";

interface WindowData {
  id: string;
}

interface WindowStore {
  windows: WindowData[];
  addWindow: (window: WindowData) => void;
  removeWindow: (id: string) => void;
  getWindow: (id: string) => WindowData | undefined;
  touchWindow: (id: string) => void;
  getStackOrder: (id: string) => number;
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
    set((state) => ({
      windows: [...state.windows.filter((window) => window.id !== id), { id }],
    }));
  },
  getStackOrder: (id: string) => {
    return get().windows.findIndex((window) => window.id === id);
  },
}));
