import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/**"),
      new URL("https://rapperank.oss-cn-hangzhou.aliyuncs.com/label/**"),
      new URL("https://images.unsplash.com/**"),
      new URL("https://nirvazure-next.oss-cn-hangzhou.aliyuncs.com/album/**"),
    ],
  },
};

export default nextConfig;
