import { writeFile } from "node:fs/promises";

const origin = "https://topicauni.edu.vn";
const outputUrl = new URL("./URL_INVENTORY.csv", import.meta.url);

const sources = [
  {
    type: "page",
    url: `${origin}/wp-json/wp/v2/pages?per_page=100&_fields=id,parent,slug,status,link,title`,
  },
  {
    type: "post",
    url: `${origin}/wp-json/wp/v2/posts?per_page=100&_fields=id,slug,status,link,title,categories`,
  },
  {
    type: "category",
    url: `${origin}/wp-json/wp/v2/categories?per_page=100&_fields=id,parent,count,slug,link,name`,
  },
  {
    type: "block",
    url: `${origin}/wp-json/wp/v2/ux-blocks?per_page=100&_fields=id,slug,status,link,title`,
  },
];

const categoryTargets = new Map([
  ["/chuyen-muc/tin-tuc/", "/tin-tuc/"],
  ["/chuyen-muc/tin-tuc/su-kien/", "/tin-tuc/su-kien/"],
  ["/chuyen-muc/tin-tuc/tin-tuc-chung/", "/tin-tuc/"],
  ["/chuyen-muc/tin-tuc-tuyen-sinh/", "/tin-tuc/tuyen-sinh/"],
  ["/chuyen-muc/thong-bao-tuyen-sinh/", "/tin-tuc/thong-bao-tuyen-sinh/"],
  ["/chuyen-muc/tuyen-dung/", "/tin-tuc/tuyen-dung/"],
]);

const retirePaths = new Set([
  "/shop/",
  "/cart/",
  "/checkout/",
  "/my-account/",
  "/test/",
]);

const mergeReviewPaths = new Set([
  "/hoc-phi/",
  "/tuyen-sinh/hoc-phi-hoc-bong/",
  "/tuyen-sinh-van-bang-2/",
  "/van-bang-hai/",
  "/de-an-quy-che-tuyen-sinh/",
  "/tuyen-sinh/de-an-tuyen-sinh/",
  "/tuyen-sinh/quy-che-tuyen-sinh/",
  "/thong-bao-tuyen-sinh/",
]);

const programPaths = new Set([
  "/cong-nghe-thong-tin/",
  "/quan-tri-kinh-doanh-marketing/",
  "/ngon-ngu-anh/",
  "/ngon-ngu-trung-quoc/",
  "/quan-tri-dich-vu-du-lich-va-lu-hanh/",
  "/cong-nghe-ky-thuat-o-to/",
  "/quan-ly-cong-nghiep/",
  "/truyen-thong-da-phuong-tien/",
]);

function decodeHtml(value = "") {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#8211;", "-")
    .replaceAll("&#038;", "&");
}

function componentFor(item, path) {
  if (item.type === "post") return "ArticlePage";
  if (item.type === "category") return "NewsCategoryPage";
  if (item.type === "block") return "InternalCMSBlock";
  if (path === "/") return "Homepage";
  if (path.startsWith("/gioi-thieu/")) return "AboutPage";
  if (programPaths.has(path)) return "ProgramDetailPage";
  if (path.startsWith("/chuong-trinh/")) return "ProgramOverviewPage";
  if (path.startsWith("/tuyen-sinh/") || mergeReviewPaths.has(path)) return "AdmissionsPage";
  if (path.startsWith("/dao-tao/") || path === "/dao-tao/") return "AcademicResourcesPage";
  if (path === "/lien-he/") return "ContactPage";
  if (["/he-thong/", "/quy-dinh/", "/bo-bieu-mau/", "/bo-quy-trinh/"].includes(path)) {
    return "StudentResourcesPage";
  }
  return "ContentPage";
}

function migrationDecision(item) {
  const path = new URL(item.link).pathname;
  const base = {
    keepUrl: "yes",
    action: "preserve",
    proposedUrl: path,
    note: "Preserve URL and migrate content verbatim before redesign.",
  };

  if (item.type === "block") {
    return {
      keepUrl: "no",
      action: "internal-only",
      proposedUrl: "",
      note: "Remove from public sitemap; current endpoint returns HTTP 200 with an empty body.",
    };
  }

  if (item.type === "category") {
    if (item.count === 0 || item.slug === "uncategorised") {
      return {
        keepUrl: "no",
        action: "noindex-merge",
        proposedUrl: "",
        note: "Empty or catch-all taxonomy; merge only after content and backlink review.",
      };
    }

    const target = categoryTargets.get(path);
    if (target) {
      return {
        keepUrl: "redirect",
        action: "301-map",
        proposedUrl: target,
        note: "Keep the legacy URL until the replacement category is live and validated.",
      };
    }
  }

  if (retirePaths.has(path)) {
    return {
      keepUrl: "review",
      action: "noindex-retire",
      proposedUrl: "",
      note: "Remove from sitemap now; return 410 only after analytics and backlink checks.",
    };
  }

  if (path === "/blog/") {
    return {
      keepUrl: "redirect",
      action: "301-map",
      proposedUrl: "/tin-tuc/",
      note: "Legacy blog index; consolidate after the new news index is live.",
    };
  }

  if (mergeReviewPaths.has(path)) {
    return {
      keepUrl: "review",
      action: "content-owner-review",
      proposedUrl: path,
      note:
        path === "/thong-bao-tuyen-sinh/"
          ? "A Page and a Post currently claim the same URL; select one canonical content owner."
          : "Potentially overlaps another admissions page; preserve until legal/content sign-off.",
    };
  }

  return base;
}

function csv(value) {
  const text = String(value ?? "").replaceAll('"', '""');
  return `"${text}"`;
}

const items = [];
for (const source of sources) {
  const response = await fetch(source.url);
  if (!response.ok) throw new Error(`${source.type} inventory failed: ${response.status}`);
  const records = await response.json();
  for (const record of records) {
    items.push({
      ...record,
      type: source.type,
      titleText: decodeHtml(record.title?.rendered ?? record.name ?? ""),
    });
  }
}

const statuses = new Map();
let cursor = 0;
async function checkStatus() {
  while (cursor < items.length) {
    const item = items[cursor++];
    if (statuses.has(item.link)) continue;
    try {
      const response = await fetch(item.link, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
      });
      statuses.set(item.link, response.status);
    } catch {
      statuses.set(item.link, 0);
    }
  }
}
await Promise.all(Array.from({ length: 12 }, checkStatus));

const header = [
  "source_type",
  "current_url",
  "title",
  "parent_id",
  "content_count",
  "http_status",
  "in_current_sitemap",
  "keep_url",
  "recommended_action",
  "proposed_url",
  "component",
  "note",
];

const rows = items
  .sort((a, b) => a.type.localeCompare(b.type) || a.link.localeCompare(b.link))
  .map((item) => {
    const path = new URL(item.link).pathname;
    const decision = migrationDecision(item);
    const inSitemap = item.type === "category" ? item.count > 0 : true;
    return [
      item.type,
      item.link,
      item.titleText,
      item.parent ?? "",
      item.count ?? "",
      statuses.get(item.link) ?? 0,
      inSitemap ? "yes" : "no",
      decision.keepUrl,
      decision.action,
      decision.proposedUrl,
      componentFor(item, path),
      decision.note,
    ]
      .map(csv)
      .join(",");
  });

await writeFile(outputUrl, `${header.map(csv).join(",")}\n${rows.join("\n")}\n`, "utf8");

const counts = Object.fromEntries(
  Object.entries(Object.groupBy(items, (item) => item.type)).map(([type, records]) => [
    type,
    records.length,
  ]),
);

console.log(
  JSON.stringify(
    {
      output: outputUrl.pathname,
      rows: items.length,
      uniqueUrls: new Set(items.map((item) => item.link)).size,
      counts,
    },
    null,
    2,
  ),
);
