import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { env } from "@/lib/env";
import { getSetting } from "@/lib/db";

const beVietnamPro = localFont({
  src: [
    { path: "./fonts/BeVietnamPro-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/BeVietnamPro-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/BeVietnamPro-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/BeVietnamPro-Bold.ttf", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-be-vietnam-pro",
});

const lora = localFont({
  src: "./fonts/Lora-Variable.ttf",
  weight: "400 700",
  display: "swap",
  variable: "--font-lora",
});

const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/topica-logo.png",
  },
  title: {
    default: "Viện Đào tạo Quốc tế Topica",
    template: "%s | Topica",
  },
  description:
    "Thông tin chương trình đào tạo từ xa, tuyển sinh và hệ thống học tập của Viện Đào tạo Quốc tế Topica.",
  openGraph: {
    title: "Viện Đào tạo Quốc tế Topica",
    description: "Chương trình đào tạo từ xa hiện đại, uy tín với nền tảng công nghệ tiên tiến.",
    url: env.NEXT_PUBLIC_SITE_URL,
    siteName: "Topica University",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/topica-logo.png",
        width: 1200,
        height: 630,
        alt: "Viện Đào tạo Quốc tế Topica",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Viện Đào tạo Quốc tế Topica",
    description: "Chương trình đào tạo từ xa hiện đại, uy tín với nền tảng công nghệ tiên tiến.",
    images: ["/topica-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSetting<{ siteTitle?: string; siteDescription?: string }>("site_settings", {});
  const title = settings.siteTitle?.trim() || DEFAULT_METADATA.title;
  const description = settings.siteDescription?.trim() || DEFAULT_METADATA.description || "";
  return {
    ...DEFAULT_METADATA,
    title: { default: title as string, template: "%s | Topica" },
    description,
    openGraph: { ...DEFAULT_METADATA.openGraph, title: title as string, description },
    twitter: { ...DEFAULT_METADATA.twitter, title: title as string, description },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <body
        className={`${beVietnamPro.variable} ${lora.variable} bg-canvas font-sans text-ink-800 antialiased`}
      >
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
