/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tasnimul.vercel.app",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
  // Add this part to handle the PDF.js canvas and binary dependencies
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  // This helps prevent Next.js from trying to bundle the server-side parts
  // of pdfjs-dist which can cause the "DOMMatrix" or worker errors.
  experimental: {
    serverExternalPackages: ["pdfjs-dist"],
  },
};

export default nextConfig;
