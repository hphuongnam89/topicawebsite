import { primaryNav, utilityNav } from "@/data/navigation";
import { programs } from "@/data/programs";
import { cms } from "@/lib/cms";

const allowedPaths = new Set(
  [
    "/",
    "/en",
    "/gioi-thieu",
    "/lien-he",
    "/chinh-sach-bao-mat",
    "/tuyen-sinh",
    "/tuyen-sinh/hoc-phi-hoc-bong",
    "/tin-tuc",
    "/tim-kiem",
    "/nhung-cau-hoi-thuong-gap",
    ...programs.map((p) => p.href.replace(/\/$/, "")),
    ...primaryNav.flatMap((group) => [
      group.href,
      ...group.columns.flatMap((column) => column.items.map((item) => item.href)),
    ]),
    ...utilityNav.map((item) => item.href),
  ]
    .filter((path): path is string => !!path && path.startsWith("/"))
    .map((path) => path.replace(/\/$/, "") || "/"),
);

export async function normalizeAnalyticsPath(value: unknown): Promise<string | null> {
  if (
    typeof value !== "string" ||
    value.length > 256 ||
    !value.startsWith("/") ||
    value.startsWith("//")
  )
    return null;
  let path: string;
  try {
    path = decodeURIComponent(value.split(/[?#]/, 1)[0]);
  } catch {
    return null;
  }
  if (
    /[\\\x00-\x20\x7f?#%]/.test(path) ||
    path.split("/").some((part) => part === "." || part === "..")
  )
    return null;
  path = path.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
  if (/^\/(admin|api|uploads)(\/|$)/.test(path)) return null;
  if (allowedPaths.has(path)) return path;
  if (!/^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(path)) return null;
  try {
    const article = /^\/tin-tuc\/([a-z0-9-]+)$/.exec(path);
    if (article) return (await cms.getArticleBySlug(article[1])) ? path : null;
    return (await cms.getPageByPath(path.slice(1))) ? path : null;
  } catch {
    return null;
  }
}
