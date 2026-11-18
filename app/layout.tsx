import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost, Manrope } from "next/font/google";
import { LogoSprite } from "../components/Logo";
import { faqs, site } from "../lib/site";
import "./globals.css";

// Titulares editoriales: serif de alto contraste.
const display = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

// Identidad de marca: sans geométrica fina, en el tono del logo.
const brand = Jost({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-brand",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  applicationName: site.name,
  keywords: [
    "estudio de transmisión Medellín",
    "estudio para creadoras de contenido",
    "creadoras de contenido Medellín",
    "convocatoria creadoras Medellín",
    "Whole Models",
    "WM Studio",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Whole Models, estudio de transmisión en Medellín" }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: ["/og.jpg"],
  },
  // Sin dirección pública (por ejemplo, una prueba local) no se indexa.
  robots: site.indexable ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

// Datos estructurados: quiénes son, dónde están y las preguntas frecuentes.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": `${site.url}/#negocio`,
      name: site.name,
      alternateName: [site.short, "WM Studio", "Whole Studios"],
      description: site.description,
      slogan: site.slogan,
      url: site.url,
      logo: `${site.url}/logo.svg`,
      image: `${site.url}/og.jpg`,
      address: {
        "@type": "PostalAddress",
        addressLocality: site.city,
        addressRegion: site.region,
        addressCountry: site.country,
      },
      areaServed: site.city,
      sameAs: [site.instagram],
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#web`,
      url: site.url,
      name: site.name,
      inLanguage: "es-CO",
      publisher: { "@id": `${site.url}/#negocio` },
    },
    {
      "@type": "FAQPage",
      "@id": `${site.url}/#preguntas`,
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

// Antes de pintar: decide si la página arranca "en vivo" (escenas fijadas y
// animadas) o quieta, según la preferencia de movimiento del sistema o la
// elección guardada de la persona. El recorrido es una historia: al recargar
// empieza siempre desde arriba.
const boot = `(function(){var d=document.documentElement;d.classList.add("js");try{history.scrollRestoration="manual"}catch(e){}var o=false;try{o=localStorage.getItem("wm-motion")==="on"}catch(e){}var r=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;d.setAttribute("data-motion",o?"on":"auto");if(!r||o){d.classList.add("live")}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${display.variable} ${brand.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <LogoSprite />
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
