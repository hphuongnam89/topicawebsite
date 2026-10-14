import http from "http";
import https from "https";
import path from "path";
import fs from "fs";
import { DatabaseSync } from "node:sqlite";
import navigationData from "../data/navigation.json";
import { programDetails } from "../data/program-details";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const DB_PATH = process.env.TOPICA_DB_PATH || path.join(process.cwd(), "data", "topica.db");

interface CheckResult {
  url: string;
  source: string;
  initialStatus: number;
  finalStatus: number;
  finalUrl: string;
  isExternal: boolean;
  redirects: number;
  ok: boolean;
  error?: string;
}

const checkUrlStatus = (
  url: string,
  maxRedirects = 5,
  redirectCount = 0,
): Promise<{
  initialStatus: number;
  finalStatus: number;
  finalUrl: string;
  isExternal: boolean;
  redirects: number;
  ok: boolean;
  error?: string;
}> => {
  return new Promise((resolve) => {
    if (url.startsWith("mailto:") || url.startsWith("tel:")) {
      return resolve({
        initialStatus: 200,
        finalStatus: 200,
        finalUrl: url,
        isExternal: false,
        redirects: 0,
        ok: true,
      });
    }

    const fullUrl = url.startsWith("http")
      ? url
      : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

    try {
      const parsedSite = new URL(SITE_URL);
      const parsedUrl = new URL(fullUrl);
      const isExternal = parsedUrl.hostname !== parsedSite.hostname;
      const client = fullUrl.startsWith("https") ? https : http;

      const req = client.get(
        {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
          path: parsedUrl.pathname + parsedUrl.search,
          headers: { "User-Agent": "Topica-Link-Auditor/1.0" },
          timeout: 8000,
        },
        async (res) => {
          const status = res.statusCode || 500;

          // Follow redirect to destination URL
          if ([301, 302, 307, 308].includes(status) && res.headers.location) {
            if (redirectCount >= maxRedirects) {
              return resolve({
                initialStatus: status,
                finalStatus: status,
                finalUrl: fullUrl,
                isExternal,
                redirects: redirectCount,
                ok: false,
                error: `Chuyển hướng vượt quá giới hạn (> ${maxRedirects} lần)`,
              });
            }

            const nextLocation = res.headers.location;
            const nextUrl = nextLocation.startsWith("http")
              ? nextLocation
              : `${parsedUrl.origin}${nextLocation.startsWith("/") ? "" : "/"}${nextLocation}`;

            const nextResult = await checkUrlStatus(nextUrl, maxRedirects, redirectCount + 1);
            return resolve({
              initialStatus: redirectCount === 0 ? status : nextResult.initialStatus,
              finalStatus: nextResult.finalStatus,
              finalUrl: nextResult.finalUrl,
              isExternal: isExternal || nextResult.isExternal,
              redirects: nextResult.redirects,
              ok: nextResult.ok,
              error: nextResult.error,
            });
          }

          // Non-redirect response: destination must be 2xx to be considered valid
          const ok = status >= 200 && status < 300;
          resolve({
            initialStatus: status,
            finalStatus: status,
            finalUrl: fullUrl,
            isExternal,
            redirects: redirectCount,
            ok,
          });
        },
      );

      req.on("timeout", () => {
        req.destroy();
        resolve({
          initialStatus: 408,
          finalStatus: 408,
          finalUrl: fullUrl,
          isExternal,
          redirects: redirectCount,
          ok: false,
          error: "Hết thời gian chờ (Timeout sau 8s)",
        });
      });

      req.on("error", (err) => {
        resolve({
          initialStatus: 500,
          finalStatus: 500,
          finalUrl: fullUrl,
          isExternal,
          redirects: redirectCount,
          ok: false,
          error: err.message,
        });
      });
    } catch (e: any) {
      resolve({
        initialStatus: 400,
        finalStatus: 400,
        finalUrl: fullUrl,
        isExternal: true,
        redirects: redirectCount,
        ok: false,
        error: e.message,
      });
    }
  });
};

async function runLinkAudit() {
  console.log("=================================================");
  console.log("🔗 TOPICA QA AUDITOR: KIỂM TRA TOÀN DIỆN LIÊN KẾT & REDIRECT");
  console.log(`🌐 Target Base URL: ${SITE_URL}`);
  console.log("=================================================\n");

  const linksToTest = new Map<string, string>();

  // 1. Quét từ Navigation Primary & Actions
  navigationData.primary.forEach((group: any) => {
    if (group.href) linksToTest.set(group.href, `Nav Group: ${group.label}`);
    group.columns?.forEach((col: any) => {
      col.items?.forEach((item: any) => {
        if (item.href) linksToTest.set(item.href, `Nav Subitem: ${item.label}`);
      });
    });
  });

  navigationData.actions?.forEach((action: any) => {
    if (action.href && !action.href.startsWith("http")) {
      linksToTest.set(action.href, `Nav Action: ${action.label}`);
    }
  });

  // 2. Quét từ 5 ngành đào tạo
  programDetails.forEach((prog) => {
    linksToTest.set(`/${prog.slug}/`, `Program Direct: ${prog.officialName}`);
  });

  // 3. Quét từ Database SQLite (Pages & Articles)
  if (fs.existsSync(DB_PATH)) {
    const db = new DatabaseSync(DB_PATH);
    try {
      const pages = db.prepare("SELECT slug, title FROM pages").all() as any[];
      pages.forEach((p) => {
        linksToTest.set(`/${p.slug}/`, `Public Page DB: ${p.title}`);
      });

      const articles = db
        .prepare("SELECT slug, title FROM articles WHERE status = 'published'")
        .all() as any[];
      articles.forEach((a) => {
        linksToTest.set(`/tin-tuc/${a.slug}/`, `Article DB: ${a.title}`);
      });
    } catch (e: any) {
      console.warn("Lưu ý: Không thể truy vấn bảng SQLite:", e.message);
    }
  }

  // 4. Các static routes cốt lõi
  const coreRoutes = [
    "/",
    "/gioi-thieu/",
    "/nganh-dao-tao/",
    "/tuyen-sinh/",
    "/tuyen-sinh/hoc-phi-hoc-bong/",
    "/chat-luong-dao-tao/",
    "/chinh-sach-bao-mat/",
    "/dieu-khoan-su-dung/",
    "/trai-nghiem-hoc-tap/",
    "/nhung-cau-hoi-thuong-gap/",
    "/tin-tuc/",
    "/lien-he/",
    "/sitemap.xml",
    "/robots.txt",
    "/llms.txt",
  ];

  coreRoutes.forEach((route) => {
    if (!linksToTest.has(route)) {
      linksToTest.set(route, "Core Route");
    }
  });

  console.log(`📋 Tổng số liên kết duy nhất được đưa vào kiểm thử: ${linksToTest.size}\n`);

  let directPassed = 0;
  let redirectPassed = 0;
  let externalPassed = 0;
  let failed = 0;
  const failureList: CheckResult[] = [];

  for (const [url, source] of linksToTest.entries()) {
    if (url === "#" || url.trim() === "") {
      console.error(`❌ [PHÁT HIỆN PLACEHOLDER LỖI '#'] Nguồn: ${source}`);
      failed++;
      failureList.push({
        url,
        source,
        initialStatus: 0,
        finalStatus: 0,
        finalUrl: url,
        isExternal: false,
        redirects: 0,
        ok: false,
        error: "Link rỗng hoặc chứa placeholder '#'",
      });
      continue;
    }

    const res = await checkUrlStatus(url);
    if (res.ok) {
      if (res.redirects > 0) {
        console.log(
          `🔀 [${res.initialStatus} ➔ ${res.finalStatus}] ${url} ➔ ${res.finalUrl} (${source})`,
        );
        redirectPassed++;
      } else {
        console.log(`✅ [${res.finalStatus}] ${url} (${source})`);
        directPassed++;
      }
      if (res.isExternal) {
        externalPassed++;
      }
    } else {
      console.error(`❌ [${res.finalStatus}] ${url} (${source}) - ${res.error || "HTTP Error"}`);
      failed++;
      failureList.push({
        url,
        source,
        initialStatus: res.initialStatus,
        finalStatus: res.finalStatus,
        finalUrl: res.finalUrl,
        isExternal: res.isExternal,
        redirects: res.redirects,
        ok: false,
        error: res.error,
      });
    }
  }

  console.log("\n=================================================");
  console.log("📊 KẾT QUẢ KIỂM THỬ LIÊN KẾT (LINK AUDIT SUMMARY)");
  console.log(`- Tổng số liên kết kiểm tra: ${linksToTest.size}`);
  console.log(`- Trực tiếp đạt (200 OK): ${directPassed}`);
  console.log(`- Chuyển hướng hợp lệ (Redirect ➔ 200 OK): ${redirectPassed}`);
  console.log(`- Liên kết bên ngoài (External): ${externalPassed}`);
  console.log(`- Thất bại (404/5xx/Broken/Timeout): ${failed}`);
  console.log("=================================================");

  if (failed > 0) {
    console.error(`\n⚠️ Phát hiện ${failed} liên kết lỗi cần xử lý:`);
    failureList.forEach((f) => console.error(`   - ${f.url} [${f.finalStatus}] (${f.source})`));
    process.exit(1);
  } else {
    console.log("\n✅ Hoàn thành kiểm thử liên kết. Không có placeholder '#' hoặc lỗi điều hướng.");
    process.exit(0);
  }
}

runLinkAudit().catch((err) => {
  console.error("Lỗi thực thi kiểm thử liên kết:", err);
  process.exit(1);
});
