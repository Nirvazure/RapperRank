import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

loadEnvConfig(process.cwd());

// Auth 在服务端读取 Shared 的 SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY，无需客户端镜像。

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://tfvzcuksahcofooqqezx.supabase.co/storage/v1/object/public/rapperank/**"),
      new URL("https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/**"),
      new URL("https://rapperank.oss-cn-hangzhou.aliyuncs.com/label/**"),
      new URL("https://images.unsplash.com/**"),
      new URL("https://nirvazure-next.oss-cn-hangzhou.aliyuncs.com/album/**"),
      new URL("https://avatars.githubusercontent.com/**"),
    ],
  },
};

export default nextConfig;
