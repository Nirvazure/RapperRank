import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import { GlobalPlayerBar } from "@/components/audio/GlobalPlayerBar";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { RapperPlayerProvider } from "@/contexts/RapperPlayerContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <RapperPlayerProvider>
          <div className="min-h-full pb-20">
            <MotionProvider>{children}</MotionProvider>
          </div>
          <GlobalPlayerBar />
        </RapperPlayerProvider>
        <Analytics />
      </body>
    </html>
  );
}
