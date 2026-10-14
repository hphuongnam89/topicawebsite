import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { localizedPath } from "@/lib/i18n/routes";
import { buildLocalizedMetadata } from "@/lib/i18n/metadata";

import { programs } from "@/data/programs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const enPath = `/en/${slug.join("/")}`;
  const viPath = localizedPath(enPath, "vi");
  const program = programs.find((p) => p.href.replace(/\/$/, "") === viPath.replace(/\/$/, ""));
  let rawTitle = program ? program.name : "Topica International Institute";
  if (viPath === "/lien-he") rawTitle = "Liên hệ";
  else if (viPath === "/gioi-thieu") rawTitle = "Giới thiệu";
  else if (viPath === "/nganh-dao-tao") rawTitle = "5 Ngành Đào tạo Cử nhân Trực tuyến";
  else if (viPath === "/tuyen-sinh") rawTitle = "Tuyển sinh";
  else if (viPath === "/tuyen-sinh/hoc-phi-hoc-bong") rawTitle = "Học phí & Học bổng";
  return buildLocalizedMetadata({
    locale: "en",
    title: rawTitle,
    viPath,
    enPath,
  });
}

export default async function EnglishPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value])
      query.append(key, item);
  }
  query.set("lang", "en");
  redirect(`${localizedPath(`/en/${slug.join("/")}`, "vi")}?${query}`);
}
