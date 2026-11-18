import type { MetadataRoute } from "next";
import { site } from "../lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // Mientras no haya dirección pública, se pide a los buscadores que no entren.
  if (!site.indexable) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
