/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["*.e2b.app"],
  images: {
    unoptimized: true,
  },
  // Browsers use /api/quote only; do not expose the internal legacy API wholesale.
  async redirects() {
    return [
      {
        source: "/rubber",
        destination: "/products/rubber",
        permanent: true,
      },
      {
        source: "/steel",
        destination: "/products/steel",
        permanent: true,
      },
      {
        source: "/aluminium",
        destination: "/products/aluminium",
        permanent: true,
      },
      {
        source: "/testimonials",
        destination: "/about",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
