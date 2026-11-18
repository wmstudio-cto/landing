/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sitio 100 % estático: `npm run build` deja la carpeta `out/` lista para
  // subir a cualquier hosting, con todo el texto ya en el HTML (clave para SEO).
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
