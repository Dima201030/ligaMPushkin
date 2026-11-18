import type { NextConfig } from "next";

const basePath = process.env.NEXT_BASE_PATH?.trim();
const normalizedBasePath =
  basePath && basePath !== "/" ? basePath.replace(/\/$/, "") : undefined;

const apiProxyTarget =
  process.env.API_PROXY_TARGET?.trim() || "http://127.0.0.1:3020";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: normalizedBasePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: normalizedBasePath ?? "",
  },
  images: {
    remotePatterns: [],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
      {
        source: "/status",
        destination: `${apiProxyTarget}/status`,
      },
    ];
  },
};

export default nextConfig;
