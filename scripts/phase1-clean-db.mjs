import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data/topica.db");

// 1. Dọn dẹp 5 trang WooCommerce rác
console.log("=== 1. CLEANING JUNK WOOCOMMERCE PAGES ===");
const junkSlugs = ['cart', 'checkout', 'my-account', 'shop', 'classic-shop'];
const updateJunkPages = db.prepare(`UPDATE pages SET status = 'archived' WHERE slug IN ('cart', 'checkout', 'my-account', 'shop', 'classic-shop')`);
const resultJunk = updateJunkPages.run();
console.log(`Updated ${resultJunk.changes} junk pages to status 'archived'.`);

// 2. Hàm làm sạch text / html
function decodeHtmlEntities(str) {
  if (!str) return str;
  return str
    .replace(/&#038;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8230;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
}

function stripShortcodes(str) {
  if (!str) return str;
  return str
    .replace(/\[\/?vc_[^\]]*\]/gi, "")
    .replace(/\[\/?wpb_[^\]]*\]/gi, "")
    .replace(/\[\/?contact-form-7[^\]]*\]/gi, "")
    .replace(/\[\/?el_[^\]]*\]/gi, "");
}

function cleanString(str) {
  if (!str) return str;
  return stripShortcodes(decodeHtmlEntities(str));
}

// 3. Làm sạch bảng articles
console.log("\n=== 2. CLEANING ARTICLES ENTITIES & SHORTCODES ===");
const articles = db.prepare("SELECT id, title, excerpt, content_html FROM articles").all();
const updateArticle = db.prepare("UPDATE articles SET title = ?, excerpt = ?, content_html = ? WHERE id = ?");

let articlesCleaned = 0;
for (const a of articles) {
  const newTitle = cleanString(a.title);
  const newExcerpt = cleanString(a.excerpt);
  const newContent = cleanString(a.content_html);

  if (newTitle !== a.title || newExcerpt !== a.excerpt || newContent !== a.content_html) {
    updateArticle.run(newTitle, newExcerpt, newContent, a.id);
    articlesCleaned++;
  }
}
console.log(`Cleaned ${articlesCleaned} articles.`);

// 4. Làm sạch bảng pages
console.log("\n=== 3. CLEANING PAGES ENTITIES & SHORTCODES ===");
const pages = db.prepare("SELECT id, title, excerpt, content_html FROM pages").all();
const updatePage = db.prepare("UPDATE pages SET title = ?, excerpt = ?, content_html = ? WHERE id = ?");

let pagesCleaned = 0;
for (const p of pages) {
  const newTitle = cleanString(p.title);
  const newExcerpt = cleanString(p.excerpt);
  const newContent = cleanString(p.content_html);

  if (newTitle !== p.title || newExcerpt !== p.excerpt || newContent !== p.content_html) {
    updatePage.run(newTitle, newExcerpt, newContent, p.id);
    pagesCleaned++;
  }
}
console.log(`Cleaned ${pagesCleaned} pages.`);

// 5. Kiểm tra lại xem còn bài viết hay trang nào sót entity/shortcode không
const remainingArticles = db.prepare("SELECT COUNT(*) as c FROM articles WHERE title LIKE '%&#%' OR excerpt LIKE '%&#%' OR content_html LIKE '%[vc_%' OR content_html LIKE '%&#%'").get();
const remainingPages = db.prepare("SELECT COUNT(*) as c FROM pages WHERE (title LIKE '%&#%' OR excerpt LIKE '%&#%' OR content_html LIKE '%[vc_%' OR content_html LIKE '%&#%') AND status != 'archived'").get();
console.log(`Remaining articles with issues: ${remainingArticles.c}`);
console.log(`Remaining active pages with issues: ${remainingPages.c}`);
