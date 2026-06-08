import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
// e.g. "/my-repo-name" — set via GitHub Actions secret NEXT_PUBLIC_BASE_PATH
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // Static HTML export — required for GitHub Pages
  output: "export",

  basePath,
  assetPrefix: basePath,

  // Image optimization requires a server, disable for static export
  images: { unoptimized: true },

  // Allow HMR WebSocket from local network IPs in development
  ...(isProd
    ? {}
    : {
        allowedDevOrigins: ["192.168.0.3", "192.168.1.*", "10.0.*.*"],
        async rewrites() {
          return [
            {
              source: "/api/:path*",
              destination: "http://localhost:4000/:path*",
            },
          ];
        },
      }),
};

export default nextConfig;
