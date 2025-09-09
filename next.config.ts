import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL('https://live.dealer-asset.co/**')
    ]
  },
};

export default nextConfig;
