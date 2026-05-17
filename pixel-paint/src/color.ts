export const TRANSPARENT_COLOR = "transparent" as const;

export type PaintColor = string | typeof TRANSPARENT_COLOR;

export function isTransparentColor(color: string): color is typeof TRANSPARENT_COLOR {
  return color === TRANSPARENT_COLOR;
}
