import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === "production" ? "/accessibility-in-hci-5z" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/accessibility-in-hci-5z" : "",
};

export default nextConfig;
