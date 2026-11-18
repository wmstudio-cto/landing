// Datos de la marca y textos de la landing. Todo sale de lo publicado en
// @wholemodels; lo que haya que ajustar se cambia aquí y se refleja en la
// página, los metadatos y los datos estructurados.
import fotos from "./fotos.json";
import talentos from "./talentos.json";

// Dirección pública del sitio. Por orden: la que se defina a mano en
// NEXT_PUBLIC_SITE_URL; si no, la que dan Vercel o Netlify al compilar.
// Sin ninguna, el sitio se marca para que los buscadores no lo indexen.
const publicUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  process.env.URL ||
  ""
).replace(/\/$/, "");

export const site = {
  name: "Whole Models",
  short: "WM",
  url: publicUrl || "https://tu-dominio.com",
  /** false mientras no haya dirección pública: noindex. */
  indexable: publicUrl !== "",
  title: "Whole Models (WM) | Estudio de transmisión en Medellín para creadoras de contenido",
  description:
    "Whole Models es un estudio de transmisión en Medellín que forma creadoras profesionales: espacios equipados, cámaras 4K, capacitaciones constantes y acompañamiento real. Convocatoria abierta.",
  slogan: "The art of becoming.",
  city: "Medellín",
  region: "Antioquia",
  country: "CO",
  instagram: "https://www.instagram.com/wholemodels",
  instagramHandle: "@wholemodels",
  dm: "https://ig.me/m/wholemodels",
} as const;

export const nav = [
  { href: "#experiencia", label: "Experiencia" },
  { href: "#talentos", label: "Talentos" },
  { href: "#transformacion", label: "Transformación" },
  { href: "#unete", label: "Únete" },
] as const;

// ESCENA 03 — The Whole Experience: el universo de WM en cuatro capítulos.
// `foto` y `focus` eligen el retrato y el encuadre mientras no haya fotos
// propias de las instalaciones, las sesiones y las clases.
export const pillars = [
  {
    title: "Instalaciones",
    text: "Espacios profesionales y cámaras 4K, pensados para verse bien en cámara.",
    foto: "06",
    focus: "50% 22%",
  },
  {
    title: "Fotografía",
    text: "Sesiones de estudio para construir una imagen con nivel editorial.",
    foto: "04",
    focus: "50% 14%",
  },
  {
    title: "Formación",
    text: "Clases cada semana: sensualidad y baile, maquillaje y presencia en cámara.",
    foto: "01",
    focus: "50% 16%",
  },
  {
    title: "Acompañamiento",
    text: "Un equipo comprometido con tu proceso y beneficios de bienestar.",
    foto: "05",
    focus: "62% 12%",
  },
] as const;

// ESCENA 04 — The Talents. Sin nombres reales todavía: cada retrato lleva lo
// que se entrena en WM y una línea editorial.
const talentCopy = [
  { title: "Presencia", line: "Lo que transmites antes de decir una palabra." },
  { title: "Confianza", line: "Se entrena cada semana." },
  { title: "Actitud", line: "La sensualidad no se improvisa." },
  { title: "Esencia", line: "Auténtica, nunca copiada." },
  { title: "Autenticidad", line: "Tu luz ya existe." },
  { title: "Determinación", line: "El cambio llega cuando decides intentarlo." },
  { title: "Conexión", line: "Frente a cámara, de verdad." },
  { title: "Luz propia", line: "Ahora es momento de mostrarla." },
];

export const pieces = fotos.map((foto, i) => ({
  ...foto,
  title: talentCopy[i]?.title ?? `Talento ${foto.id}`,
  line: talentCopy[i]?.line ?? "",
  alt: `Retrato en blanco y negro de una creadora de Whole Models. ${talentCopy[i]?.title ?? ""}.`,
}));

export type Piece = (typeof pieces)[number];

// Talents: las mismas 8 fotos con el revelado de estudio uniforme
// (public/talentos, generado por herramientas/recortes.mjs).
export const talents = talentos.map((foto, i) => ({
  ...foto,
  title: pieces[i]?.title ?? `Talento ${foto.id}`,
  line: pieces[i]?.line ?? "",
  alt: pieces[i]?.alt ?? "Retrato en blanco y negro de una creadora de Whole Models.",
}));

export const piece = (id: string) => pieces.find((p) => p.id === id) ?? pieces[0];

// Fotos de cada escena (ids de lib/fotos.json).
export const scenes = {
  entrance: "02",
  transformation: "04",
} as const;
// Texto del manifiesto: lo usa la pieza de vídeo de Remotion (npm run studio).
export const manifesto = {
  lead: "No prometemos",
  denials: ["magia", "atajos"],
  promise: "Prometemos",
  lines: ["un proceso claro", "acompañamiento real", "un equipo comprometido con tu crecimiento"],
} as const;

export const faqs = [
  {
    q: "¿Qué es Whole Models?",
    a: "Whole Models (WM) es un estudio de transmisión en Medellín. Funciona como una plataforma de desarrollo personal y acompañamiento para creadoras, con espacios profesionales, capacitaciones constantes y beneficios de bienestar.",
  },
  {
    q: "¿Dónde está el estudio?",
    a: "En Medellín, Colombia. Escríbenos por Instagram y te compartimos la ubicación y cómo conocer el estudio.",
  },
  {
    q: "¿Qué capacitaciones reciben las creadoras?",
    a: "Clases semanales de sensualidad y baile, clases de maquillaje y formación en presencia frente a cámara: confianza, actitud y conexión.",
  },
  {
    q: "¿Qué buscan en una creadora nueva?",
    a: "Personas auténticas, con actitud, determinación y ganas de crecer. Lo demás se aprende en el proceso.",
  },
  {
    q: "¿Cómo aplico a la convocatoria?",
    a: "Escríbenos por mensaje directo en Instagram (@wholemodels). Te contamos lo que necesitas saber para empezar.",
  },
  {
    q: "¿Prometen resultados rápidos?",
    a: "No. No prometemos magia ni atajos. Prometemos un proceso claro, acompañamiento real y un equipo comprometido con tu crecimiento.",
  },
  {
    q: "¿Hay edad mínima?",
    a: "Sí. La convocatoria es únicamente para personas mayores de 18 años.",
  },
] as const;
