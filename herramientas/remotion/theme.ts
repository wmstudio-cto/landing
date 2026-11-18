// Única fuente de verdad para las composiciones de Remotion de WM.
import { Easing } from "remotion";
import { brandFonts, palette } from "../../lib/palette";

export const theme = {
  colors: palette,
  fonts: brandFonts,
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 },
    count: { damping: 30, stiffness: 60, mass: 1 }, // contadores
  },
} as const;

export const rgba = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
