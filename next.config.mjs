/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Optimisation des images (CDC §4.6). Domaines distants à ajouter ici le cas échéant.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    // En-têtes de sécurité (CDC §4.3 — alignement OWASP).
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
    ];
    // HSTS : forçage HTTPS en production (ignoré par les navigateurs en HTTP).
    if (process.env.NODE_ENV === "production") {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
