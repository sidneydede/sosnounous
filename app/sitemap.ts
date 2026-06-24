import type { MetadataRoute } from "next";
import { site, mainNav, footerLegalNav } from "@/lib/data/site";
import { services } from "@/lib/data/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");

  const staticPaths = [
    "/",
    ...mainNav.map((n) => n.href),
    ...footerLegalNav.map((n) => n.href),
    "/connexion",
    "/inscription",
  ];

  const servicePaths = services.map((s) => `/services/${s.slug}`);

  return [...new Set([...staticPaths, ...servicePaths])].map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
