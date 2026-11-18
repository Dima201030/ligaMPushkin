import type { NextConfig } from "next";

const basePath = process.env.NEXT_BASE_PATH?.trim();

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: basePath && basePath !== "/" ? basePath : undefined,
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
