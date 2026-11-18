// Recorta a las modelos de su fondo para integrarlas en la escena 3D.
// Todo ocurre en este equipo: el modelo de recorte viene dentro del paquete
// @imgly/background-removal-node y las fotos no se envían a ningún sitio.
// Uso (desde la raíz): `npm run recortes`.
//
// Por cada figura genera en public/figuras:
//   <nombre>.webp          la modelo sin fondo (con transparencia), en blanco y negro
//   <nombre>-relieve.webp  un mapa de relieve para la luz y la profundidad
//
// Va en tres fases, cada una en su propio proceso, porque la herramienta de
// recorte trae su propia versión de sharp y no pueden cargarse las dos a la vez.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = "recursos/Fotos";
const OUT = "public/figuras";
const TMP = ".recortes";
const WORK_HEIGHT = 2200; // tamaño al que se calcula el recorte

// crop: fracción de la foto que se usa (arriba, abajo). width: ancho final.
const JOBS = [
  { name: "entrada", file: "_EMT2593 copia 2.jpg", crop: [0.04, 0.62], width: 1500 },
  { name: "portal", file: "_EMT4125 copia 2.jpg", crop: [0.06, 0.66], width: 1500 },
  { name: "pilar-1", file: "_EMT4407 copia1.jpg", crop: [0.1, 0.78], width: 900 },
  { name: "pilar-2", file: "_EMT4125 copia 2.jpg", crop: [0.06, 0.8], width: 900 },
  { name: "pilar-3", file: "_EMT4164 copia 2.jpg", crop: [0.08, 0.8], width: 900 },
  { name: "pilar-4", file: "_EMT2593 copia 2.jpg", crop: [0.04, 0.8], width: 900 },
];
// Talents: las 8 fotos reveladas igual que la primera (fondo gris de estudio,
// mismo contraste). Mismo orden que la galería (fotos.mjs).
// scale: alto de la ventana respecto al alto de la figura; dx: desplazamiento
// horizontal en fracción del ancho; headroom: aire sobre la cabeza.
const TALENTS = [
  { file: "_EMT4164 copia 2.jpg" },
  { file: "_EMT2593 copia 2.jpg" },
  { file: "_EMT7679 copia.jpg" },
  { file: "_EMT4125 copia 2.jpg" },
  // El recorte de esta foto arrastra la cama: se encuadra a mano y el fondo se
  // oscurece hasta el gris de estudio dejando la escena apenas insinuada.
  { file: "_EMT0045 copia 2.jpg", window: [0.25, 0.0, 0.66], keep: 0.22 },
  { file: "_EMT4407 copia1.jpg" },
  { file: "_EMT2379 copia 4.jpg" },
  { file: "066b0335e0b2082768e6b8e688e805f7 copia.jpg" },
];
const TALENT_W = 1100;
const TALENT_H = Math.round(TALENT_W / 0.72);
const TALENT_WIDTHS = [420, 760, 1100];

const FILES = [...new Set([...JOBS.map((job) => job.file), ...TALENTS.map((t) => t.file)])];
const slug = (file) => file.replace(/[^a-zA-Z0-9]+/g, "_");

const phase = process.argv[2];

if (!phase) {
  mkdirSync(OUT, { recursive: true });
  mkdirSync(TMP, { recursive: true });
  const self = fileURLToPath(import.meta.url);
  for (const step of ["prep", "matte", "finish"]) {
    execFileSync(process.execPath, [self, step], { stdio: "inherit" });
  }
}

// 1. Copias de trabajo más pequeñas.
if (phase === "prep") {
  const { default: sharp } = await import("sharp");
  for (const file of FILES) {
    const out = join(TMP, `${slug(file)}.png`);
    if (existsSync(out)) continue;
    await sharp(join(SRC, file), { limitInputPixels: false }).rotate().resize({ height: WORK_HEIGHT }).png().toFile(out);
    console.log("copia", file);
  }
}

// 2. Recorte del fondo.
if (phase === "matte") {
  const { removeBackground } = await import("@imgly/background-removal-node");
  for (const file of FILES) {
    const out = join(TMP, `${slug(file)}.cut.png`);
    if (existsSync(out)) continue;
    const input = new Blob([readFileSync(join(TMP, `${slug(file)}.png`))], { type: "image/png" });
    const blob = await removeBackground(input, { model: "medium", output: { format: "image/png", quality: 1 } });
    writeFileSync(out, Buffer.from(await blob.arrayBuffer()));
    console.log("recorte", file);
  }
}

// 3. Encuadre, blanco y negro, transparencia y relieve.
if (phase === "finish") {
  const { default: sharp } = await import("sharp");
  const manifest = {};
  for (const job of JOBS) {
    const rgba = join(TMP, `${slug(job.file)}.cut.png`);
    const meta = await sharp(rgba).metadata();
    const top = Math.round(meta.height * job.crop[0]);
    const height = Math.round(meta.height * (job.crop[1] - job.crop[0]));

    // Se ajusta a los lados reales de la figura para no arrastrar aire vacío.
    const band = await sharp(rgba).extract({ left: 0, top, width: meta.width, height }).png().toBuffer();
    const alphaBand = await sharp(band).extractChannel(3).raw().toBuffer({ resolveWithObject: true });
    let left = alphaBand.info.width;
    let right = 0;
    for (let y = 0; y < alphaBand.info.height; y += 4) {
      for (let x = 0; x < alphaBand.info.width; x += 2) {
        if (alphaBand.data[y * alphaBand.info.width + x] > 24) {
          if (x < left) left = x;
          if (x > right) right = x;
        }
      }
    }
    const pad = Math.round(meta.width * 0.02);
    left = Math.max(0, left - pad);
    right = Math.min(meta.width - 1, right + pad);

    const { data, info } = await sharp(band)
      .extract({ left, top: 0, width: right - left + 1, height })
      .resize({ width: Math.min(job.width, right - left + 1) })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const one = { raw: { width: info.width, height: info.height, channels: 1 } };
    const alpha = await sharp(data, { raw: info }).extractChannel(3).raw().toBuffer();
    const gray = await sharp(data, { raw: info }).removeAlpha().grayscale().raw().toBuffer();
    await sharp(gray, one)
      .joinChannel(gray, one)
      .joinChannel(gray, one)
      .joinChannel(alpha, one)
      .webp({ quality: 82, alphaQuality: 90, effort: 5 })
      .toFile(join(OUT, `${job.name}.webp`));

    // Relieve: la silueta difuminada (el centro del cuerpo queda más cerca)
    // matizada con la luz de la foto.
    const sigma = Math.max(6, info.width * 0.035);
    const soft = await sharp(alpha, one).blur(sigma).extractChannel(0).raw().toBuffer();
    const light = await sharp(gray, one).blur(sigma * 0.35).extractChannel(0).raw().toBuffer();
    const relief = Buffer.alloc(soft.length);
    for (let i = 0; i < soft.length; i++) relief[i] = Math.round(soft[i] * (0.72 + 0.28 * (light[i] / 255)));
    await sharp(relief, one).resize({ width: 512 }).webp({ quality: 70 }).toFile(join(OUT, `${job.name}-relieve.webp`));

    manifest[job.name] = { width: info.width, height: info.height };
    console.log(job.name, `${info.width}x${info.height}`);
  }
  writeFileSync("lib/figuras.json", JSON.stringify(manifest, null, 2) + "\n");

  // ---------- Talents: mismo revelado para las 8 fotos ----------
  const TOUT = "public/talentos";
  mkdirSync(TOUT, { recursive: true });
  const talentManifest = [];
  const smooth = (t) => {
    const v = Math.max(0, Math.min(1, t));
    return v * v * (3 - 2 * v);
  };
  for (const [i, t] of TALENTS.entries()) {
    const id = String(i + 1).padStart(2, "0");
    const cut = join(TMP, `${slug(t.file)}.cut.png`);
    const src = await sharp(cut).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = src.info.width;
    const H = src.info.height;

    // Contorno de la figura.
    let top = H;
    let bottom = 0;
    for (let y = 0; y < H; y += 2) {
      for (let x = 0; x < W; x += 2) {
        if (src.data[(y * W + x) * 4 + 3] > 40) {
          if (y < top) top = y;
          if (y > bottom) bottom = y;
        }
      }
    }
    let winH = (bottom - top) * (t.scale ?? 0.7);
    let winW = winH * 0.72;
    // Centro horizontal: el del torso y la cabeza, no el de los brazos.
    let sum = 0;
    let count = 0;
    for (let y = top; y < Math.min(H, top + winH * 0.5); y += 2) {
      for (let x = 0; x < W; x += 2) {
        const a = src.data[(y * W + x) * 4 + 3];
        if (a > 128) {
          sum += x;
          count++;
        }
      }
    }
    const cx = (count ? sum / count : W / 2) + (t.dx ?? 0) * winW;
    let x0 = Math.round(cx - winW / 2);
    let y0 = Math.round(top - (t.headroom ?? 0.07) * winH);
    if (t.window) {
      winH = t.window[2] * H;
      winW = winH * 0.72;
      x0 = Math.round(t.window[0] * W);
      y0 = Math.round(t.window[1] * H);
    }
    const w = Math.round(winW);
    const h = Math.round(winH);

    // Color de la foto original y transparencia del recorte (sin arrastrar
    // lo que la herramienta deja en los píxeles de fondo).
    const photo = await sharp(join(TMP, `${slug(t.file)}.png`)).removeAlpha().toBuffer();
    const matte = await sharp(cut).extractChannel(3).toBuffer();
    const merged = await sharp(photo).joinChannel(matte).png().toBuffer();

    // Ventana sobre la figura (lo que cae fuera se rellena transparente).
    const ex = { left: Math.max(0, x0), top: Math.max(0, y0) };
    ex.width = Math.min(W, x0 + w) - ex.left;
    ex.height = Math.min(H, y0 + h) - ex.top;
    const framed = await sharp(merged)
      .ensureAlpha()
      .extract(ex)
      .extend({
        left: ex.left - x0,
        top: ex.top - y0,
        right: x0 + w - (ex.left + ex.width),
        bottom: y0 + h - (ex.top + ex.height),
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .resize(TALENT_W, TALENT_H, { fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const px = framed.data;
    const n = TALENT_W * TALENT_H;

    // Tono: el mismo rango para todas, medido solo sobre la figura.
    const lum = new Float32Array(n);
    const hist = new Uint32Array(256);
    let solid = 0;
    for (let p = 0; p < n; p++) {
      const g = 0.2126 * px[p * 4] + 0.7152 * px[p * 4 + 1] + 0.0722 * px[p * 4 + 2];
      lum[p] = g;
      if (px[p * 4 + 3] > 220) {
        hist[Math.min(255, Math.round(g))]++;
        solid++;
      }
    }
    const pct = (q) => {
      let acc = 0;
      for (let v = 0; v < 256; v++) {
        acc += hist[v];
        if (acc >= solid * q) return v;
      }
      return 255;
    };
    const lo = pct(0.006);
    const hi = pct(0.994);

    const out = Buffer.alloc(n);
    for (let y = 0; y < TALENT_H; y++) {
      for (let x = 0; x < TALENT_W; x++) {
        const p = y * TALENT_W + x;
        // Fondo de estudio como el de la primera foto: gris carbón, algo más
        // claro detrás de la figura, con un grano muy fino.
        const dx = (x / TALENT_W - 0.5) / 0.66;
        const dy = (y / TALENT_H - 0.38) / 0.6;
        const r = Math.sqrt(dx * dx + dy * dy);
        let bg = 60 - 46 * smooth(r) + (Math.random() - 0.5) * 5;
        // Borde: se cierra un poco y se oscurece para no arrastrar el fondo original.
        const raw = px[p * 4 + 3] / 255;
        const a = smooth((raw - 0.1) / 0.82);
        let v = Math.max(0, Math.min(1, (lum[p] - lo) / Math.max(1, hi - lo)));
        v = 8 + v * 234;
        // Escena original apenas insinuada en lugar del fondo liso.
        if (t.keep) bg += v * t.keep;
        if (a < 0.98) v *= Math.pow(a, 0.6);
        out[p] = Math.round(Math.max(0, Math.min(255, v * a + bg * (1 - a))));
      }
    }

    const one = { raw: { width: TALENT_W, height: TALENT_H, channels: 1 } };
    for (const tw of TALENT_WIDTHS) {
      const img = sharp(out, one).resize({ width: tw });
      await img.clone().avif({ quality: 50, effort: 5 }).toFile(join(TOUT, `${id}-${tw}.avif`));
      await img.clone().webp({ quality: 74 }).toFile(join(TOUT, `${id}-${tw}.webp`));
    }
    talentManifest.push({ id, width: TALENT_W, height: TALENT_H, widths: TALENT_WIDTHS });
    console.log("talento", id, t.file);
  }
  writeFileSync("lib/talentos.json", JSON.stringify(talentManifest, null, 2) + "\n");
}
