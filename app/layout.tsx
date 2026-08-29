import type { Metadata } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { env } from "@/lib/env";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-be-vietnam-pro",
});

const lora = Lora({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-lora",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
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
