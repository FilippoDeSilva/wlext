/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  swDest: 'public/sw.js',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/wlext\.is\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'wlext-cache'
      }
    },
    {
      urlPattern: /\.(png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache'
      }
    },
    {
      urlPattern: /\/offline$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'offline-cache'
      }
    },
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200
        }
      }
    }
  ]
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
