import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const API_URL = 'https://topicauni.edu.vn/wp-json/wp/v2';
const DB_PATH = path.join(process.cwd(), 'data', 'topica.db');
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec(`CREATE TABLE IF NOT EXISTS pages (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, excerpt TEXT, content_html TEXT NOT NULL, featured_image TEXT, status TEXT DEFAULT 'published', seo_title TEXT, seo_description TEXT, published_at TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);`);

async function fetchAll(endpoint) {
  let allItems = []; let page = 1;
  while (true) {
    const res = await fetch(API_URL + '/' + endpoint + '?per_page=100&page=' + page);
    if (!res.ok) break;
    const items = await res.json();
    if (items.length === 0) break;
    allItems = allItems.concat(items);
    const totalPages = res.headers.get('x-wp-totalpages');
    if (totalPages && page >= parseInt(totalPages)) break;
    page++;
  }
  return allItems;
}

function decodeHtml(html) { return html.replace(/&#(\d+);/g, (m, d) => String.fromCharCode(d)); }

async function migrate() {
  const cats = await fetchAll('categories');
  const insertCat = db.prepare('INSERT INTO categories (name, slug, description, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET name=excluded.name, description=excluded.description');
  const catMap = new Map();
  for (const cat of cats) {
    try {
      insertCat.run(cat.name, cat.slug, cat.description || null, new Date().toISOString());
      catMap.set(cat.id, cat.slug);
    } catch(e) {}
  }
  const getCatBySlug = db.prepare('SELECT id FROM categories WHERE slug = ?');
  const wpCatToLocalId = new Map();
  for (const [wpId, slug] of catMap.entries()) {
    const local = getCatBySlug.get(slug);
    if(local) wpCatToLocalId.set(wpId, local.id);
  }

  const media = await fetchAll('media');
  const mediaMap = new Map();
  for (const m of media) mediaMap.set(m.id, m.source_url);

  const posts = await fetchAll('posts');
  const insertArt = db.prepare('INSERT INTO articles (title, slug, excerpt, content_html, featured_image, category_id, tags, author_name, is_featured, status, seo_title, seo_description, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, excerpt=excluded.excerpt, featured_image=excluded.featured_image, category_id=excluded.category_id, status=excluded.status');
  for (const post of posts) {
    try {
      const title = decodeHtml(post.title?.rendered || '');
      const excerpt = decodeHtml(post.excerpt?.rendered || '');
      const content = post.content?.rendered || '';
      const featuredImage = mediaMap.get(post.featured_media) || null;
      let localCatId = null;
      if (post.categories?.length > 0) localCatId = wpCatToLocalId.get(post.categories[0]) || null;
      const pubDate = post.date_gmt ? post.date_gmt + 'Z' : new Date().toISOString();
      insertArt.run(title, post.slug, excerpt, content, featuredImage, localCatId, null, 'Ban Biên Tập Topica', post.sticky ? 1 : 0, 'published', title, excerpt, pubDate, pubDate, pubDate);
    } catch(e) {}
  }

  const pages = await fetchAll('pages');
  const insertPage = db.prepare('INSERT INTO pages (title, slug, excerpt, content_html, featured_image, status, seo_title, seo_description,published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, excerpt=excluded.excerpt, featured_image=excluded.featured_image');
  for (const page of pages) {
    try {
      const title = decodeHtml(page.title?.rendered || '');
      const excerpt = decodeHtml(page.excerpt?.rendered || '');
      const content = page.content?.rendered || '';
      const featuredImage = mediaMap.get(page.featured_media) || null;
      const pubDate = page.date_gmt ? page.date_gmt + 'Z' : new Date().toISOString();
      insertPage.run(title, page.slug, excerpt, content, featuredImage, 'published', title, excerpt, pubDate, pubDate, pubDate);
    } catch(e) {}
  }
  console.log('Migration complete. Posts:', posts.length, 'Pages:', pages.length, 'Catp:', cats.length);
}
migrate();

