/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  images: {
    domains: ['images.openfoodfacts.org'],
  },
  // Disable font optimization to avoid network issues during build
  optimizeFonts: false,
  // Disable ESLint during build to avoid blocking issues
  eslint: {
    ignoreDuringBuilds: true,
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
