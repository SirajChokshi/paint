import { PixelCanvas } from 'pixel-paint'

declare global {
  interface Window {
    pixel: PixelCanvas;
    virtualScreenScale: number;
    virtualScreenWidth: number;
    virtualScreenHeight: number;
  }
}