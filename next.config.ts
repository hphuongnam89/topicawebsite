import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "font-src 'self' data:",
  "form-action 'self' https://www.tuyensinh.topicauni.edu.vn",
  "frame-ancestors 'self'",
  "img-src 'self' data: blob: https://topicauni.edu.vn https://images.unsplash.com",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `connect-src 'self'${isDevelopment ? " ws: wss:" : ""}`,
  "worker-src 'self' blob:",
  ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
  ...(isDevelopment
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]),
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/chuyen-muc/thong-bao-tuyen-sinh", destination: "/tin-tuc?category=thong-bao-tuyen-sinh", permanent: true },
      { source: "/chuyen-muc/tin-tuc-tuyen-sinh", destination: "/tin-tuc?category=tin-tuc-tuyen-sinh", permanent: true },
      { source: "/category/tin-tuc-tuyen-sinh", destination: "/tin-tuc?category=tin-tuc-tuyen-sinh", permanent: true },
      { source: "/chuyen-muc/tin-tuc", destination: "/tin-tuc/", permanent: true },
      { source: "/chuyen-muc/tin-tuc/tin-tuc-chung", destination: "/tin-tuc?category=tin-tuc-chung", permanent: true },
      { source: "/chuyen-muc/tin-tuc/su-kien", destination: "/tin-tuc?category=su-kien", permanent: true },
      { source: "/chuyen-muc/tuyen-dung", destination: "/tin-tuc?category=tuyen-dung", permanent: true },
      { source: "/blog", destination: "/tin-tuc/", permanent: true },
      { source: "/hoc-phi", destination: "/tuyen-sinh/hoc-phi-hoc-bong/", permanent: true },
      { source: "/tuyen-sinh-van-bang-2", destination: "/van-bang-hai/", permanent: true },
      { source: "/de-an-quy-che-tuyen-sinh", destination: "/tuyen-sinh/", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "topicauni.edu.vn",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  devIndicators: false,
};

export default nextConfig;
