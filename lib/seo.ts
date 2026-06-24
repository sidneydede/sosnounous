import type { Metadata } from "next";
import { site } from "@/lib/data/site";

/**
 * Fabrique de métadonnées SEO par page (CDC RG-43, §4.6).
 * Centralise titres, descriptions et Open Graph pour des pages cohérentes.
 */
export function buildMetadata(opts: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const url = opts.path ? `${site.url}${opts.path}` : site.url;
  const fullTitle = `${opts.title} | ${site.name}`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: opts.description,
      url,
      siteName: site.name,
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: opts.description,
    },
  };
}
