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

  // Turbopack configuration
  turbopack: {},

  // Exclude node_modules from output file tracing to reduce FS scanning
  outputFileTracingExcludes: {
    "*": ["./node_modules/**/*"],
  },

  // Keep Webpack as a fallback/parallel config
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
