import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data/topica.db");
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("=== SQLITE TABLES & COUNTS ===");
for (const t of tables) {
  try {
    const row = db.prepare(`SELECT COUNT(*) as c FROM ${t.name}`).get();
    console.log(`${t.name}: ${row.c} rows`);
  } catch (err) {
    console.log(`${t.name}: error (${err.message})`);
  }
}

console.log("\n=== SETTINGS KEYS ===");
try {
  const settings = db.prepare("SELECT key, updated_at FROM settings").all();
  for (const s of settings) {
    console.log(`- ${s.key} (updated: ${s.updated_at})`);
  }
} catch (err) {
  console.log("Settings query error:", err.message);
}

console.log("\n=== CATEGORIES ===");
try {
  const cats = db.prepare("SELECT id, name, slug FROM categories").all();
  for (const c of cats) {
    console.log(`- [${c.id}] ${c.name} (${c.slug})`);
  }
} catch (err) {
  console.log("Categories query error:", err.message);
}

console.log("\n=== SAMPLE ARTICLES (Top 5) ===");
try {
  const articles = db.prepare("SELECT id, title, slug, published_at FROM articles LIMIT 5").all();
  for (const a of articles) {
    console.log(`- [${a.id}] ${a.title} (slug: ${a.slug})`);
  }
} catch (err) {
  console.log("Articles query error:", err.message);
}

console.log("\n=== SAMPLE PAGES (Top 5) ===");
try {
  const pages = db.prepare("SELECT id, title, slug FROM pages LIMIT 5").all();
  for (const p of pages) {
    console.log(`- [${p.id}] ${p.title} (slug: ${p.slug})`);
  }
} catch (err) {
  console.log("Pages query error:", err.message);
}

console.log("\n=== LEADS SUMMARY ===");
try {
  const leads = db.prepare("SELECT status, COUNT(*) as c FROM leads GROUP BY status").all();
  for (const l of leads) {
    console.log(`- Status '${l.status}': ${l.c} leads`);
  }
} catch (err) {
  console.log("Leads query error:", err.message);
}
