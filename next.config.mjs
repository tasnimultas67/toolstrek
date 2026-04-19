/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "tasnimul.vercel.app" },
      { protocol: "https", hostname: "unsplash.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },

  // 1. Move serverExternalPackages to top-level (out of experimental)
  serverExternalPackages: ["pdfjs-dist"],

  // 2. Add an empty turbopack object to tell Next.js you acknowledge the setup
  experimental: {
    turbopack: {},
  },

  // 3. Keep Webpack config for the 'canvas' alias fix
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
