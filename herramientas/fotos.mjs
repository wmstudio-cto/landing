// Prepara las fotos de recursos/Fotos para la web: blanco y negro, varios
// anchos y formatos ligeros (AVIF y WebP). Uso (desde la raíz): `npm run fotos`.
// El orden de esta lista es el orden de la galería.
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC = "recursos/Fotos";
const OUT = "public/fotos";
const WIDTHS = [420, 760, 1200, 1800];

const ORDER = [
  "_EMT4164 copia 2.jpg",
  "_EMT2593 copia 2.jpg",
  "_EMT7679 copia.jpg",
  "_EMT4125 copia 2.jpg",
  "_EMT0045 copia 2.jpg",
  "_EMT4407 copia1.jpg",
  "_EMT2379 copia 4.jpg",
  "066b0335e0b2082768e6b8e688e805f7 copia.jpg",
];

mkdirSync(OUT, { recursive: true });
const manifest = [];

for (const [i, file] of ORDER.entries()) {
  const id = String(i + 1).padStart(2, "0");
  const base = sharp(join(SRC, file), { limitInputPixels: false }).rotate().grayscale();
  const meta = await sharp(join(SRC, file), { limitInputPixels: false }).metadata();
  const widths = WIDTHS.filter((w) => w <= meta.width);
  for (const w of widths) {
    const resized = base.clone().resize({ width: w });
    await resized.clone().avif({ quality: 48, effort: 5 }).toFile(join(OUT, `${id}-${w}.avif`));
    await resized.clone().webp({ quality: 72 }).toFile(join(OUT, `${id}-${w}.webp`));
  }
  manifest.push({ id, width: meta.width, height: meta.height, widths });
  console.log(id, file, `${meta.width}x${meta.height}`, widths.join("/"));
}

writeFileSync("lib/fotos.json", JSON.stringify(manifest, null, 2) + "\n");
