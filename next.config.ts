import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["next-sanity"],
  serverExternalPackages: ["@byteink/mppjs", "@byteink/mppjs-win32-x64"],
};

export default nextConfig;
