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

  // Stable top-level key
  serverExternalPackages: ["pdfjs-dist"],

  // MOVE THIS HERE: Next.js 16 expects turbopack at the top level
  // This satisfies the "empty turbopack config" requirement mentioned in your error log
  turbopack: {},

  // Keep Webpack as a fallback/parallel config
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
