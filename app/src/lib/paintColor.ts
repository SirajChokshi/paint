import { TRANSPARENT_COLOR } from "pixel-paint";
import type { BackgroundColor } from "../stores/paintStore";

export const TRANSPARENT_PATTERN = `url("data:image/svg+xml,%3Csvg width='8' height='8' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='8' height='8' fill='white'/%3E%3Cpath d='M0 8 L8 0' stroke='%23ff0000' stroke-width='1'/%3E%3C/svg%3E")`;

export function isTransparentBackground(
  color: BackgroundColor,
): color is typeof TRANSPARENT_COLOR {
  return color === TRANSPARENT_COLOR;
}

export function getBackgroundCssBackground(color: BackgroundColor): string {
  if (isTransparentBackground(color)) {
    return `${TRANSPARENT_PATTERN} white`;
  }

  return color;
}
