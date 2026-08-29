import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    serverActions: {
      // PDFs are uploaded through a Server Action; raise the body cap to match
      // the 10 MB limit the upload action itself enforces (default is 1 MB).
      bodySizeLimit: "10mb",
    },
  },/* config options here */};

export default nextConfig;
