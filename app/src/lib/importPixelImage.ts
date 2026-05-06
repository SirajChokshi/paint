export function reportPixelImportError(error: unknown) {
  console.error("Unable to import image", error);
}

export function importPixelImage(
  data: string,
  options?: Parameters<(typeof window)["pixel"]["import"]>[1]
) {
  return window.pixel.import(data, options).catch(reportPixelImportError);
}
