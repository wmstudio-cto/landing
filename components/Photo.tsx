type Source = { id: string; width: number; height: number; widths: number[]; alt: string };

const srcSet = (p: Source, folder: string, format: "avif" | "webp") =>
  p.widths.map((w) => `/${folder}/${p.id}-${w}.${format} ${w}w`).join(", ");

/** Una foto en AVIF/WebP, en el ancho justo para cada pantalla y en carga diferida.
 *  `folder`: "fotos" (originales en blanco y negro) o "talentos" (revelado de estudio). */
export function Photo({ piece, sizes, folder = "fotos" }: { piece: Source; sizes: string; folder?: string }) {
  const fallback = piece.widths[Math.min(1, piece.widths.length - 1)];
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(piece, folder, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(piece, folder, "webp")} sizes={sizes} />
      <img
        src={`/${folder}/${piece.id}-${fallback}.webp`}
        alt={piece.alt}
        width={piece.width}
        height={piece.height}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </picture>
  );
}
