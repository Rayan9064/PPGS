/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.openfoodfacts.org'],
  },
  // Telegram Mini App optimizations
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://web.telegram.org https://t.me",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
