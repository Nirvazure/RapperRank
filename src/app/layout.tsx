import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist } from "next/font/google";
import { AppChrome } from "@/components/layout/AppChrome";
import { RapperPlayerProvider } from "@/contexts/RapperPlayerContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RapperRank | Global Rap Ratings",
  description: "全球说唱歌手六维评分与排行榜应用。",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <RapperPlayerProvider>
          <AppChrome>{children}</AppChrome>
        </RapperPlayerProvider>
        <Analytics />
      </body>
    </html>
  );
}
