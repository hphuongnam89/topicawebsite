import { programs } from "@/data/programs";

const knownPaths = new Set([
  "/",
  "/gioi-thieu",
  "/nganh-dao-tao",
  "/tuyen-sinh",
  "/hoc-phi",
  "/tuyen-sinh/hoc-phi-hoc-bong",
  "/chuong-trinh",
  "/tin-tuc",
  "/tim-kiem",
  "/dam-bao-chat-luong",
  "/he-thong",
  "/lien-he",
  "/nhung-cau-hoi-thuong-gap",
  ...programs.map((program) => `/${program.slug}`),
]);

/** Keep a bounded route label, never arbitrary URL/query/user input. */
export function safePublicPath(value: unknown): string | null {
  if (
    typeof value !== "string" ||
    value.length > 2048 ||
    !value.startsWith("/") ||
    value.startsWith("//")
  )
    return null;
  const path = value.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  if (/^\/(admin|api)(\/|$)/.test(path) || /[\r\n\\]/.test(path)) return null;
  if (knownPaths.has(path)) return path;
  if (path.startsWith("/tin-tuc/")) return "/tin-tuc/[slug]";
  return "/[page]";
}
