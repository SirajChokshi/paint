const MAX_IMPORT_ERROR_PREVIEW_LENGTH = 160;

export function getPixelImportErrorMessage(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const dataUrlMatch = /data:([^,\s"']*),([^\s"']*)/i.exec(rawMessage);
  if (dataUrlMatch) {
    const metadata = dataUrlMatch[1] || "unknown";
    return rawMessage.replace(
      dataUrlMatch[0],
      `data URL (${metadata}, ${dataUrlMatch[0].length} characters)`
    );
  }

  return rawMessage.length > MAX_IMPORT_ERROR_PREVIEW_LENGTH
    ? `${rawMessage.slice(0, MAX_IMPORT_ERROR_PREVIEW_LENGTH)}... (${rawMessage.length} characters)`
    : rawMessage;
}

export function reportPixelImportError(error: unknown) {
  console.error("Unable to import image", error);
}

export function importPixelImage(
  data: string,
  options?: Parameters<(typeof window)["pixel"]["import"]>[1]
) {
  return window.pixel.import(data, options).catch(reportPixelImportError);
}
