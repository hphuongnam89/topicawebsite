const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const pages = ["/", "/gioi-thieu/", "/tin-tuc/", "/tuyen-sinh/", "/lien-he/", "/en/"];
const internalHref = /href=["'](\/[^"']*)["']/g;

async function main() {
  const urls = new Set<string>();
  for (const page of pages) {
    const response = await fetch(new URL(page, siteUrl));
    if (!response.ok) throw new Error(`${page} returned ${response.status}`);
    const html = await response.text();
    for (const match of html.matchAll(internalHref)) {
      const href = new URL(match[1], siteUrl).pathname;
      if (href) urls.add(href);
    }
  }

  const failures: string[] = [];
  for (const path of urls) {
    const response = await fetch(new URL(path, siteUrl), { redirect: "manual" });
    if (response.status >= 400) failures.push(`${path} (${response.status})`);
  }

  if (failures.length > 0) throw new Error(`Broken internal links: ${failures.join(", ")}`);
  console.log(`Checked ${urls.size} internal links: all reachable.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
