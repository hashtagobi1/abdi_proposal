/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // The map lives at /selections (each event at /selections/<event>).
    return [{ source: "/", destination: "/selections", permanent: false }];
  },
};

module.exports = nextConfig;
