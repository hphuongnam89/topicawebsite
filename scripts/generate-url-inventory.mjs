import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";

const db = new DatabaseSync("data/topica.db");

// 1. Static routes
const staticRoutes = [
  "/",
  "/gioi-thieu",
  "/tuyen-sinh",
  "/tuyen-sinh/hoc-phi-hoc-bong",
  "/tin-tuc",
  "/lien-he",
  "/nhung-cau-hoi-thuong-gap",
  "/tim-kiem",
];

// 2. Programs
const programSlugs = [
  "quan-tri-kinh-doanh-marketing",
  "quan-tri-dich-vu-du-lich-va-lu-hanh",
  "cong-nghe-thong-tin",
  "ngon-ngu-anh",
  "ngon-ngu-trung-quoc",
];

// 3. Navigation URLs
const navJson = JSON.parse(fs.readFileSync("data/navigation.json", "utf-8"));
const navUrls = new Set();
for (const group of navJson.primary) {
  if (group.href) navUrls.add(group.href);
  for (const col of group.columns || []) {
    for (const item of col.items || []) {
      if (item.href) navUrls.add(item.href);
    }
  }
}
for (const u of navJson.utility || []) {
  if (u.href) navUrls.add(u.href);
}

// 4. DB Pages (70 rows)
const dbPages = db.prepare("SELECT id, title, slug, status FROM pages").all();

// 5. DB Articles (31 rows)
const dbArticles = db.prepare("SELECT id, title, slug, status FROM articles").all();

// 6. Admin routes
const adminRoutes = [
  "/admin",
  "/admin/login",
  "/admin/homepage",
  "/admin/articles",
  "/admin/articles/new",
  "/admin/articles/categories",
  "/admin/pages",
  "/admin/pages/new",
  "/admin/leads",
  "/admin/media",
  "/admin/settings",
  "/admin/settings/account",
  "/admin/users",
];

console.log("=== SUMMARY OF INVENTORY ===");
console.log(`- Static Routes: ${staticRoutes.length}`);
console.log(`- Program Routes: ${programSlugs.length}`);
console.log(`- Nav Menu Distinct URLs: ${navUrls.size}`);
console.log(`- DB Pages: ${dbPages.length}`);
console.log(`- DB Articles: ${dbArticles.length}`);
console.log(`- Admin Routes: ${adminRoutes.length}`);

// Combine all distinct public URLs
const allPublicUrls = new Map();

for (const r of staticRoutes) {
  allPublicUrls.set(r, { type: "static", label: r });
}
for (const p of programSlugs) {
  allPublicUrls.set(`/${p}`, { type: "program", label: p });
}
for (const u of navUrls) {
  if (!allPublicUrls.has(u)) {
    allPublicUrls.set(u, { type: "nav_link", label: u });
  }
}
for (const page of dbPages) {
  const url = `/${page.slug}`;
  if (!allPublicUrls.has(url)) {
    allPublicUrls.set(url, { type: "cms_page", label: page.title, status: page.status });
  } else {
    allPublicUrls.get(url).dbPage = page.title;
  }
}
for (const art of dbArticles) {
  const url = `/tin-tuc/${art.slug}`;
  allPublicUrls.set(url, { type: "cms_article", label: art.title, status: art.status });
}

console.log(`Total Unique Public URLs to inventory: ${allPublicUrls.size}`);

// Test HTTP status on localhost:3000
async function testUrls() {
  const results = [];
  console.log("Testing status of key URLs against http://localhost:3000 ...");

  for (const [url, info] of allPublicUrls.entries()) {
    try {
      const res = await fetch(`http://localhost:3000${url}`, { method: "GET" });
      results.push({ url, httpStatus: res.status, ...info });
    } catch (err) {
      results.push({ url, httpStatus: "ERR", error: err.message, ...info });
    }
  }

  // Summary by status
  const statusCounts = {};
  for (const r of results) {
    statusCounts[r.httpStatus] = (statusCounts[r.httpStatus] || 0) + 1;
  }
  console.log("\n=== HTTP STATUS BREAKDOWN ===");
  console.log(statusCounts);

  // Group errors (non-200)
  const failed = results.filter(r => r.httpStatus !== 200 && r.httpStatus !== 307 && r.httpStatus !== 308);
  console.log(`\n=== FAILED / 404 / ERR URLs (${failed.length}) ===`);
  for (const f of failed) {
    console.log(`- [${f.status}] ${f.url} (${f.type}: ${f.label})`);
  }

  // Output JSON report
  fs.writeFileSync("docs/url-inventory-results.json", JSON.stringify({ results, statusCounts }, null, 2));
  console.log("\nSaved detailed results to docs/url-inventory-results.json");
}

testUrls();
