import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data/topica.db");

console.log("=== CHECK JUNK WOOCOMMERCE PAGES ===");
const junkSlugs = ['cart', 'checkout', 'my-account', 'shop', 'classic-shop'];
const junkPages = db.prepare(`SELECT id, slug, title, status FROM pages WHERE slug IN ('cart', 'checkout', 'my-account', 'shop', 'classic-shop')`).all();
console.log("Found junk pages:", junkPages);

console.log("\n=== CHECK ARTICLES WITH SHORTCODES / ENTITIES ===");
const articlesWithEntities = db.prepare(`SELECT id, slug, title, excerpt FROM articles WHERE title LIKE '%&#%' OR excerpt LIKE '%&#%' OR content_html LIKE '%[vc_%' OR content_html LIKE '%&#%' LIMIT 10`).all();
console.log(`Found ${articlesWithEntities.length} sample articles with entities/shortcodes:`);
for (const a of articlesWithEntities) {
  console.log(`- [${a.id}] ${a.title} (slug: ${a.slug})`);
  if (a.excerpt) console.log(`  Excerpt: ${a.excerpt.substring(0, 100)}...`);
}

const totalArticlesWithEntities = db.prepare(`SELECT COUNT(*) as count FROM articles WHERE title LIKE '%&#%' OR excerpt LIKE '%&#%' OR content_html LIKE '%[vc_%' OR content_html LIKE '%&#%'`).get();
console.log(`Total articles needing cleanup: ${totalArticlesWithEntities.count}`);

const totalPagesWithEntities = db.prepare(`SELECT COUNT(*) as count FROM pages WHERE title LIKE '%&#%' OR excerpt LIKE '%&#%' OR content_html LIKE '%[vc_%' OR content_html LIKE '%&#%'`).get();
console.log(`Total pages needing cleanup: ${totalPagesWithEntities.count}`);
