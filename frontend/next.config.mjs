/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:4000';

const nextConfig = {
  allowedDevOrigins: ['*.e2b.app'],
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/rubber',
        destination: '/products/rubber',
        permanent: true,
      },
      {
        source: '/steel',
        destination: '/products/steel',
        permanent: true,
      },
      {
        source: '/aluminium',
        destination: '/products/aluminium',
        permanent: true,
      },
      {
        source: '/testimonials',
        destination: '/about',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
