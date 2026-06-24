import type { MetadataRoute } from "next";
import { site } from "@/lib/data/site";

export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // L'espace authentifié, l'API et les pages utilitaires ne sont pas indexés
      disallow: ["/api/", "/espace", "/verification", "/reinitialiser-mot-de-passe"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
