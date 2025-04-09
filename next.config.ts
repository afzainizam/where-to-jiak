import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "maps.googleapis.com",
      "maps.gstatic.com",
      "lh3.googleusercontent.com",
      "rhinopass.s3.amazonaws.com",
      "static.wixstatic.com",
      "www.labula.sg" // ✅ Add this line
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
