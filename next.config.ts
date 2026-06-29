import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

loadEnvConfig(process.cwd());

// Turbopack 仅将 NEXT_PUBLIC_* 内联到客户端；.env 仍使用 SUPABASE_URL / SUPABASE_KEY
if (process.env.SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.SUPABASE_URL;
}
if (process.env.SUPABASE_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_KEY = process.env.SUPABASE_KEY;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/**"),
      new URL("https://rapperank.oss-cn-hangzhou.aliyuncs.com/label/**"),
      new URL("https://images.unsplash.com/**"),
      new URL("https://nirvazure-next.oss-cn-hangzhou.aliyuncs.com/album/**"),
      new URL("https://avatars.githubusercontent.com/**"),
    ],
  },
};

export default nextConfig;
