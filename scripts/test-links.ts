import http from "http";
import https from "https";
import path from "path";
import fs from "fs";
import { DatabaseSync } from "node:sqlite";
import navigationData from "../data/navigation.json";
import { programDetails } from "../data/program-details";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const DB_PATH = path.join(process.cwd(), "data", "topica.db");

interface CheckResult {
  url: string;
  source: string;
  status: number;
  ok: boolean;
  error?: string;
}

const checkUrlStatus = (url: string): Promise<{ status: number; ok: boolean; error?: string }> => {
  return new Promise((resolve) => {
    if (url.startsWith("mailto:") || url.startsWith("tel:")) {
      return resolve({ status: 200, ok: true });
    }

    const fullUrl = url.startsWith("http") ? url : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
    const client = fullUrl.startsWith("https") ? https : http;

    try {
      const parsedUrl = new URL(fullUrl);
      const req = client.get(
        {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
          path: parsedUrl.pathname + parsedUrl.search,
          headers: { "User-Agent": "Topica-Link-Auditor/1.0" },
          timeout: 8000,
        },
        (res) => {
          const status = res.statusCode || 500;
          const ok = status >= 200 && status < 400;
          resolve({ status, ok });
        }
      );

      req.on("timeout", () => {
        req.destroy();
        resolve({ status: 408, ok: false, error: "Timeout after 8s" });
      });

      req.on("error", (err) => {
        resolve({ status: 500, ok: false, error: err.message });
      });
    } catch (e: any) {
      resolve({ status: 400, ok: false, error: e.message });
    }
  });
};

async function runLinkAudit() {
  console.log("=================================================");
  console.log("🔗 TOPICA QA AUDITOR: KIỂM TRA TOÀN DIỆN LIÊN KẾT");
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

      const articles = db.prepare("SELECT slug, title FROM articles WHERE status = 'published'").all() as any[];
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

  let passed = 0;
  let failed = 0;
  const failureList: CheckResult[] = [];

  for (const [url, source] of linksToTest.entries()) {
    if (url === "#" || url.trim() === "") {
      console.error(`❌ [PHÁT HIỆN PLACEHOLDER LỖI '#'] Nguồn: ${source}`);
      failed++;
      failureList.push({ url, source, status: 0, ok: false, error: "Link rỗng hoặc chứa placeholder '#'" });
      continue;
    }

    const res = await checkUrlStatus(url);
    if (res.ok) {
      console.log(`✅ [${res.status}] ${url} (${source})`);
      passed++;
    } else {
      console.error(`❌ [${res.status}] ${url} (${source}) - ${res.error || "HTTP Error"}`);
      failed++;
      failureList.push({ url, source, status: res.status, ok: false, error: res.error });
    }
  }

  console.log("\n=================================================");
  console.log("📊 KẾT QUẢ KIỂM THỬ LIÊN KẾT (LINK AUDIT SUMMARY)");
  console.log(`- Tổng số liên kết: ${linksToTest.size}`);
  console.log(`- Thành công (200/3xx): ${passed}`);
  console.log(`- Thất bại (404/5xx/Lỗi): ${failed}`);
  console.log("=================================================");

  if (failed > 0) {
    console.error(`\n⚠️ Phát hiện ${failed} liên kết lỗi:`);
    failureList.forEach((f) => console.error(`   - ${f.url} [${f.status}] (${f.source})`));
    process.exit(1);
  } else {
    console.log("\n🎉 XÁC NHẬN: 100% liên kết hoạt động hoàn hảo! Không có liên kết hỏng hoặc placeholder.");
    process.exit(0);
  }
}

runLinkAudit().catch((err) => {
  console.error("Lỗi thực thi kiểm thử liên kết:", err);
  process.exit(1);
});
