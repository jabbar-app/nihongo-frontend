/// <reference types="node" />
import withPWA from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";


const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Use current directory as root so Next doesn't pick up parent lockfiles (D:\Web\package-lock.json)
  turbopack: {
    root: process.cwd(),
  },
};

export default withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
})(nextConfig);
