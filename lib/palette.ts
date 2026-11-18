// Paleta y tipografías de WM sin dependencias, para usarlas también fuera de
// Remotion. Dirección de arte "Liquid Gold": negro obsidiana y un oro que
// aparece poco, como una obra de arte.

// En la web las variables las define next/font; en el CLI de Remotion se usa
// la familia cargada con @remotion/google-fonts.
export const brandFonts = {
  // Titulares editoriales: serif de alto contraste
  display: "var(--font-display, 'Bodoni Moda'), Didot, 'Bodoni MT', 'Times New Roman', serif",
  // Identidad de marca: sans geométrica fina.
  brand: "var(--font-brand, 'Jost'), 'Arial Black', 'Helvetica Neue', Arial, sans-serif",
  body: "var(--font-body, 'Manrope'), 'Helvetica Neue', Arial, sans-serif",
} as const;

export const palette = {
  bg: "#080808", // Obsidian Black
  bgAlt: "#191919", // Deep Graphite
  primary: "#C69A45", // Liquid Gold
  goldLight: "#E5C88C", // Champagne Gold
  goldDeep: "#8F6B28",
  accent: "#F1EEE8", // Ivory
  text: "#F1EEE8",
  textDim: "#8E8A82",
  glow: "rgba(198, 154, 69, 0.4)",
} as const;

export const GOLD_STOPS = [
  { o: 0, k: "goldDeep" },
  { o: 0.3, k: "primary" },
  { o: 0.5, k: "goldLight" },
  { o: 0.7, k: "primary" },
  { o: 1, k: "goldDeep" },
] as const;
