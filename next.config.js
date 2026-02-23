const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
  turbopack: {},
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // We explicitly OMIT the 'sandbox' directive here to ensure players work
            value: "frame-ancestors 'self' https://wlext.is https://*.wlext.is;",
          },
        ],
      },
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
