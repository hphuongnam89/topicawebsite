import { programs } from "@/data/programs";

const englishRoutes: Record<string, string> = {
  "/": "/en",
  "/gioi-thieu": "/en/about",
  "/nganh-dao-tao": "/en/programs",
  "/tuyen-sinh": "/en/admissions",
  "/tuyen-sinh/hoc-phi-hoc-bong": "/en/tuition",
  "/lien-he": "/en/contact",
};

export function localizedPath(pathname: string, locale: "vi" | "en"): string {
  const path = pathname.replace(/\/$/, "") || "/";
  if (locale === "en") {
    if (path === "/en" || path.startsWith("/en/")) return path;
    const program = programs.find((item) => item.href.replace(/\/$/, "") === path);
    return program ? `/en/programs/${program.id}` : englishRoutes[path] || `/en${path === "/" ? "" : path}`;
  }
  if (path === "/en") return "/";
  if (path.startsWith("/en/")) return englishToVietnamese(path);
  const program = programs.find((item) => item.href.replace(/\/$/, "") === path);
  return program ? program.href : path;
}

function englishToVietnamese(path: string): string {
  const fixed = Object.entries(englishRoutes).find(([, english]) => english === path);
  if (fixed) return fixed[0];
  const match = path.match(/^\/en\/programs\/([^/]+)$/);
  if (match) {
    const program = programs.find((item) => item.id === match[1]);
    if (program) return program.href;
  }
  return path.replace(/^\/en(?=\/)/, "") || "/";
}
