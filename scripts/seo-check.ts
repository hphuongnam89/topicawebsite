import http from "http";
import https from "https";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const checkUrl = (url: string): Promise<number> => {
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, (res) => {
        resolve(res.statusCode || 500);
      })
      .on("error", (err) => {
        console.error(`Error checking ${url}:`, err.message);
        resolve(500);
      });
  });
};

async function run() {
  console.log(`🔍 Khởi động trình kiểm tra SEO cho ${SITE_URL}...`);
  const urlsToCheck = [
    `${SITE_URL}/`,
    `${SITE_URL}/gioi-thieu`,
    `${SITE_URL}/tin-tuc`,
    `${SITE_URL}/tuyen-sinh`,
    `${SITE_URL}/lien-he`,
    `${SITE_URL}/sitemap.xml`,
    `${SITE_URL}/robots.txt`,
    `${SITE_URL}/llms.txt`,
  ];

  let hasError = false;

  for (const url of urlsToCheck) {
    console.log(`Kiểm tra ${url} ...`);
    const status = await checkUrl(url);
    if (status === 200) {
      console.log(`✅ [OK] ${url} (Trạng thái: ${status})`);
    } else {
      console.error(`❌ [LỖI] ${url} (Trạng thái: ${status})`);
      hasError = true;
    }
  }

  if (hasError) {
    console.error(
      "⚠️ Quá trình kiểm tra phát hiện một số lỗi. Vui lòng kiểm tra lại cấu hình hệ thống hoặc URL.",
    );
    process.exit(1);
  } else {
    console.log("🎉 Tất cả các trang cốt lõi đều trả về 200 OK. Hệ thống đã sẵn sàng cho bot SEO.");
    process.exit(0);
  }
}

run();
