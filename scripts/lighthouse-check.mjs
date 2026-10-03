const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const startedAt = performance.now();
const response = await fetch(url);
const html = await response.text();
const elapsed = Math.round(performance.now() - startedAt);

if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
if (!/<title>[^<]+<\/title>/i.test(html)) throw new Error("Missing document title");
if (!/<meta[^>]+name=["']description["'][^>]+content=["'][^"']+/i.test(html)) {
  throw new Error("Missing meta description");
}

console.log(`Lighthouse prerequisite smoke check passed: ${response.status} in ${elapsed}ms.`);
