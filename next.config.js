/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Load these at runtime instead of bundling them: Next 13's bundler
    // can't parse the modern JavaScript they ship.
    serverComponentsExternalPackages: ["@vercel/blob", "undici"],
  },
  async redirects() {
    // The map lives at /selections (each event at /selections/<event>).
    return [{ source: "/", destination: "/selections", permanent: false }];
  },
};

module.exports = nextConfig;
