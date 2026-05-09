import * as Toolbar from "@radix-ui/react-menubar";
import styled from "@emotion/styled";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useFileStore } from "../../stores/fileStore";
import { FrameBus } from "../../lib/frame";
import { Menu } from "./Menu";
import { useWindowStore } from "../../stores/windowStore";
import { WINDOW_IDS } from "../../App";
import { PAINT_APP_PALETTE_IDS, PAINT_APP_PALETTES } from "../../lib/palette";
import {
  getActivePaintPalette,
  usePaintStore,
} from "../../stores/paintStore";
import { canvasHistory } from "../../services/canvasHistory";
import {
  getPixelImportErrorMessage,
  reportPixelImportError,
} from "../../lib/importPixelImage";
import { createAutopaletteFromImageSource } from "../../lib/autopalette";

const MenubarWrapper = styled(Toolbar.Root)`
  display: flex;
  align-items: stretch;
  justify-content: flex-start;

  background-color: var(--mac-white);
  border-bottom: 2px solid var(--mac-black);
  height: 21px;
  width: 100%;
  z-index: 9999;
  font-family: var(--chicago);
  font-size: 12px;
  box-shadow: 0 1px 0 var(--mac-white);

  button {
    all: unset;
    padding: 0 10px;
    cursor: default;
    font-family: var(--chicago);
    font-size: 12px;
    line-height: 19px;
    height: 19px;

    &:hover,
    &[aria-expanded="true"] {
      background-color: var(--mac-black);
      color: var(--mac-white);
    }
  }
`;

export default function Menubar() {
  const { addWindow, getWindow, removeWindow } = useWindowStore();
  const { save, files } = useFileStore();
  const { paletteId, customPalette, setPaletteId, setCustomPalette } =
    usePaintStore();
  const importInputRef = useRef<HTMLInputElement>(null);
  const importAutopaletteInputRef = useRef<HTMLInputElement>(null);
  const [historyState, setHistoryState] = useState(canvasHistory.getState());

  useEffect(() => {
    return canvasHistory.subscribe(setHistoryState);
  }, []);

  function reportInteractiveImportError(error: unknown) {
    reportPixelImportError(error);
    window.alert(`Could not import image: ${getPixelImportErrorMessage(error)}`);
  }

  function importImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        void canvasHistory.import(reader.result).catch(reportInteractiveImportError);
      }
    };
    reader.readAsDataURL(file);
  }

  function importAutopalette(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        return;
      }

      const source = reader.result;
      const previousPalette = getActivePaintPalette(usePaintStore.getState());
      void createAutopaletteFromImageSource(source)
        .then(async (palette) => {
          await canvasHistory.importWithPalette(source, palette);
          setCustomPalette(palette);
        })
        .catch((error) => {
          window.pixel?.setPalette(previousPalette, { remap: false });
          reportInteractiveImportError(error);
        });
    };
    reader.readAsDataURL(file);
  }

  return (
    <MenubarWrapper className="font-sm">
      <input
        ref={importInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={importImage}
      />
      <input
        ref={importAutopaletteInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={importAutopalette}
      />
      <Menu
        actions={[
          {
            name: "About Pixel Paint",
            onClick: () => {
              addWindow({
                id: WINDOW_IDS.about,
                position: {
                  x: 80,
                  y: 40,
                },
              });
            },
          },
          {
            name: "Preferences",
            items: [
              {
                name: "Palette",
                items: [
                  ...PAINT_APP_PALETTE_IDS.map((id) => ({
                    name: `${!customPalette && paletteId === id ? "✓" : " "} ${PAINT_APP_PALETTES[id].name}`,
                    onClick: () => setPaletteId(id),
                  })),
                  ...(customPalette
                    ? [
                        {
                          name: "✓ Image Autopalette",
                          onClick: () => setCustomPalette(customPalette),
                        },
                      ]
                    : []),
                ],
              },
            ],
          },
          {
            name: "Quit",
            onClick: () => FrameBus.quit(),
          },
        ]}
      >
        <button>⌘</button>
      </Menu>
      <Menu
        actions={[
          {
            name: "New",
            onClick: () => {
              window.pixel.clear();
            },
          },
          {
            name: "Open",
            items:
              files.length > 0
                ? files.slice(0, 5).map((file) => ({
                    name: `${file.name}.img`,
                    onClick: () => {
                      void canvasHistory
                        .replaceWithImport(file.payload, {
                          resolution: "renderer",
                        })
                        .catch(reportInteractiveImportError);
                    },
                  }))
                : [
                    {
                      name: "No files",
                      onClick: () => {},
                      disabled: true,
                    },
                  ],
          },
          {
            name: "Save",
            onClick: () => {
              const name = window.prompt("Save as:")?.trim();
              if (!name) {
                return;
              }

              const uri = window.pixel.export();

              save({ name, payload: uri });
            },
          },
          {
            name: "Import",
            onClick: () => importInputRef.current?.click(),
          },
          {
            name: "Import Autopalette",
            onClick: () => importAutopaletteInputRef.current?.click(),
          },
        ]}
      >
        <button>File</button>
      </Menu>
      <Menu
        actions={[
          {
            name: "Undo",
            onClick: () => canvasHistory.undo(),
            disabled: !historyState.canUndo,
          },
          {
            name: "Redo",
            onClick: () => canvasHistory.redo(),
            disabled: !historyState.canRedo,
          },
        ]}
      >
        <button>Edit</button>
      </Menu>
      <Menu
        actions={[
          {
            name: getWindow(WINDOW_IDS.tools) ? "✓ Tools" : "  Tools",
            onClick: () => {
              if (getWindow(WINDOW_IDS.tools)) {
                removeWindow(WINDOW_IDS.tools);
              } else {
                addWindow({
                  id: WINDOW_IDS.tools,
                  position: { x: 15, y: 15 },
                });
              }
            },
          },
          {
            name: getWindow(WINDOW_IDS.canvas) ? "✓ Canvas" : "  Canvas",
            onClick: () => {
              if (getWindow(WINDOW_IDS.canvas)) {
                removeWindow(WINDOW_IDS.canvas);
              } else {
                addWindow({
                  id: WINDOW_IDS.canvas,
                  position: { x: 180, y: 15 },
                });
              }
            },
          },
        ]}
      >
        <button>View</button>
      </Menu>
    </MenubarWrapper>
  );
}
