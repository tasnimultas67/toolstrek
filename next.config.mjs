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

  // qpdf-wasm uses SharedArrayBuffer-backed WebAssembly memory. The unlocker
  // route must be cross-origin isolated so its pthread workers can receive
  // those buffers. Keep the isolation scoped to this one tool and its assets.
  async headers() {
    return [
      {
        source: "/tools/pdf-unlocker",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
      {
        source: "/qpdf/:path*",
        headers: [
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/transformers/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // ⚠️ Do NOT add `outputFileTracingExcludes` for node_modules here.
  // The Route Handlers under `app/(main)/api/*` rely on Next.js tracing their
  // runtime dependencies into each function bundle. Excluding node_modules
  // strips the `next/dist/compiled/*` runtime the handlers require, so every
  // function crashed on the platform (HTTP 500 on all /api/* routes) while the
  // pre-rendered pages kept working. Leave the tracing defaults in place.

  // Keep Webpack as a fallback/parallel config
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
