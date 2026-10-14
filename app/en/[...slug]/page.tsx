import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { localizedPath } from "@/lib/i18n/routes";
import { buildLocalizedMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const enPath = `/en/${slug.join("/")}`;
  const viPath = localizedPath(enPath, "vi");
  return buildLocalizedMetadata({
    locale: "en",
    title: slug.join(" "),
    viPath,
    enPath,
  });
}

export default async function EnglishPage({ params, searchParams }: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) query.append(key, item);
  }
  query.set("lang", "en");
  redirect(`${localizedPath(`/en/${slug.join("/")}`, "vi")}?${query}`);
}
