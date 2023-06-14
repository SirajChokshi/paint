import { create } from "zustand";
import { persist } from 'zustand/middleware'
import { getStorageKey } from "./utils";

const FILE_STORE_KEY = getStorageKey("files")

export interface SaveFile {
  name: string;
  date: string;
  content: ImageData;
}

interface FileStore {
  files: SaveFile[];
  save: (file: SaveFile) => void;
  delete: (name: string) => void;
}

export const useFileStore = create(
  persist<FileStore>(
    (set) => ({
      files: [],
      save: (file) =>
        set((state) => ({
          files: [...state.files, file],
        })),
      delete: (name) =>
        set((state) => ({
          files: state.files.filter((file) => file.name !== name),
        })),
    }),
    {
      name: FILE_STORE_KEY,
    }
  )
);