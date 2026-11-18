// Vectoriza el logo real de WM (recursos/WM_LOGO_ARTE-02) y lo deja como
// trazado SVG reutilizable: lib/logoPath.ts, public/logo.svg y app/icon.svg.
import sharp from "sharp";
import potrace from "potrace";
import { writeFileSync } from "node:fs";

const SRC = "recursos/WM_LOGO_ARTE-02 (1).png";
const SCALE = 5;

const trimmed = await sharp(SRC).trim().toBuffer({ resolveWithObject: true });
const { width, height } = trimmed.info;
const big = await sharp(trimmed.data)
  .resize({ width: width * SCALE, kernel: "lanczos3" })
  .flatten({ background: "#ffffff" })
  .extend({ top: 24, bottom: 24, left: 24, right: 24, background: "#ffffff" })
  .blur(3.2)
  .png()
  .toBuffer({ resolveWithObject: true });

const svg = await new Promise((resolve, reject) =>
  potrace.trace(big.data, { threshold: 128, turdSize: 120, optTolerance: 1.2, alphaMax: 1.25 }, (err, out) =>
    err ? reject(err) : resolve(out),
  ),
);

const d = svg.match(/ d="([^"]+)"/)[1].replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n)))).replace(/\s+/g, " ").trim();
const w = big.info.width;
const h = big.info.height;
writeFileSync(
  "lib/logoPath.ts",
  `// Generado por herramientas/logo.mjs a partir del logo real. No editar a mano.\nexport const LOGO = {\n  width: ${w},\n  height: ${h},\n  d: ${JSON.stringify(d)},\n} as const;\n`,
);
writeFileSync(
  "public/logo.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><path fill="#D9A441" fill-rule="evenodd" d="${d}"/></svg>\n`,
);
writeFileSync(
  "app/icon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${w}" y2="${h}"><stop offset="0" stop-color="#8C5A16"/><stop offset="0.3" stop-color="#D9A441"/><stop offset="0.5" stop-color="#F6DFA4"/><stop offset="0.7" stop-color="#D9A441"/><stop offset="1" stop-color="#8C5A16"/></linearGradient></defs><rect width="${w}" height="${h}" rx="${Math.round(w * 0.22)}" fill="#000"/><g transform="translate(${w * 0.06} ${h * 0.06}) scale(0.88)"><path fill="url(#g)" fill-rule="evenodd" d="${d}"/></g></svg>\n`,
);await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w / 2}" height="${h / 2}"><rect width="100%" height="100%" fill="#111"/><path fill="#D9A441" fill-rule="evenodd" d="${d}"/></svg>`))
  .png()
  .toFile(process.argv[2] ?? "logo-check.png");
console.log("logo", w, "x", h, "| trazado:", d.length, "caracteres");

