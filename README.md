# Whole Models — landing

Sitio de Whole Models (WM), estudio de transmisión en Medellín. Es un sitio
estático hecho con Next.js: al compilar se genera la carpeta `out/` con HTML,
CSS, JavaScript e imágenes listos para cualquier hosting.

## Requisitos

- Node.js 20.9 o superior (recomendado 22).

## Trabajar en local

```bash
npm install
npm run dev
```

Abre <http://localhost:3210>.

## Desplegar

### Opción A — Vercel (recomendada)

1. Sube esta carpeta a un repositorio de GitHub, GitLab o Bitbucket.
2. En vercel.com: **Add New → Project**, elige el repositorio y pulsa **Deploy**.
   Vercel detecta Next.js y usa `vercel.json`; no hay que configurar nada más.
3. Cuando tengas dominio: **Settings → Domains** y añádelo.

### Opción B — Netlify

1. Sube esta carpeta a un repositorio.
2. En netlify.com: **Add new site → Import an existing project**, elige el
   repositorio. `netlify.toml` ya define el comando (`npm run build`) y la
   carpeta a publicar (`out`).
3. Cuando tengas dominio: **Domain management → Add a domain**.

### Opción C — Sin repositorio (Netlify Drop)

1. `npm install` y `npm run build`.
2. Arrastra la carpeta `out/` a <https://app.netlify.com/drop>.

En esta opción el sitio queda marcado como **no indexable** (ver abajo) hasta
que lo compiles con tu dirección pública.

## Dirección pública y buscadores

La dirección del sitio (para la URL canónica, el sitemap y la imagen al
compartir en redes) se toma, por orden, de:

1. `NEXT_PUBLIC_SITE_URL`, si la defines (por ejemplo `https://wholemodels.com`);
2. la que da Vercel al compilar (`VERCEL_PROJECT_PRODUCTION_URL`), que pasa a
   ser tu dominio propio en cuanto lo conectes;
3. la que da Netlify al compilar (`URL`).

Si no hay ninguna, el sitio se publica con `noindex` y un `robots.txt` que pide
a los buscadores no entrar, para que no se indexe una dirección provisional.

Con dominio propio, lo más limpio es definir `NEXT_PUBLIC_SITE_URL` en las
variables de entorno del proyecto (Vercel: **Settings → Environment
Variables**; Netlify: **Site configuration → Environment variables**) y volver
a desplegar.

## Dónde se cambia cada cosa

| Qué | Dónde |
| --- | --- |
| Textos, preguntas frecuentes, enlaces de Instagram | `lib/site.ts` |
| Titulares en inglés y su traducción | `app/page.tsx` (`FlipTitle en=… es=…`) |
| Colores y tipografías | `app/globals.css` (variables al inicio) y `lib/palette.ts` |
| Escultura 3D y polvo dorado | `components/sculpture.ts` |
| Coreografía del scroll | `components/Experience.tsx` |

## Herramientas de imagen (opcional, solo en local)

Las imágenes de `public/` ya están generadas y forman parte del sitio. Solo hace
falta regenerarlas si cambias las fotos originales, que van en
`recursos/Fotos` (no se suben al repositorio).

```bash
npm run herramientas   # instala las herramientas (una sola vez, unos 300 MB)
npm run fotos          # fotos en blanco y negro para el sitio
npm run recortes       # modelos sin fondo y revelado de Talents
npm run logo           # vector del logo, favicon
npm run og             # imagen para compartir en redes (Remotion)
```

El recorte de fondo se hace en el propio equipo: las fotos no se envían a
ningún servicio externo.
