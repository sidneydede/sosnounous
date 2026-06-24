import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { site } from "@/lib/data/site";

// Typographie officielle de la charte : Jost (geometric sans).
const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.signature}`,
    template: `%s | ${site.name}`,
  },
  description: site.baseline,
  applicationName: site.name,
  keywords: [
    "nounou Abidjan",
    "garde d'enfants Côte d'Ivoire",
    "baby-sitter Abidjan",
    "aide ménagère",
    "personnel de maison",
    "agence de placement domestique",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: site.name,
    title: `${site.name} — ${site.signature}`,
    description: site.baseline,
    url: site.url,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#15324b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Données structurées (SEO — CDC RG-43)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.name,
    description: site.baseline,
    slogan: site.signature,
    areaServed: "Abidjan, Côte d'Ivoire",
    telephone: site.contact.phone,
    email: site.contact.email,
    url: site.url,
  };

  return (
    <html lang="fr" className={jost.variable}>
      <body>
        <a href="#contenu" className="skip-link">
          Aller au contenu principal
        </a>
        <Header />
        <main id="contenu">{children}</main>
        <Footer />
        <CookieConsent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
