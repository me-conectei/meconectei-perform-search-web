import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'meconectei.com.br',
      },
    ],
  },
};

export default nextConfig;
