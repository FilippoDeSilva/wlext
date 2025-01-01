/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
  images: {
    domains: ['wlext.is'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wlext.is',
        port: '',
        pathname: '/wp-content/**',
      },
      {
        protocol: 'https',
        hostname: '*.wlext.is',
        port: '',
        pathname: '/wp-content/**',
      }
    ],
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  headers: async () => {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
