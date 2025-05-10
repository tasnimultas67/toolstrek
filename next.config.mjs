/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tasnimul.vercel.app",
      },
    ],
  },
};

export default nextConfig;
