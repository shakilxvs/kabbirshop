/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Products/branding are managed via external URLs (see spec: no upload requirement).
    // Any HTTPS host is allowed since the admin can point to any image CDN.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
