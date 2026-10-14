import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedMetadata({
    locale: "en",
    title: "Topica International Institute",
    viPath: "/",
    enPath: "/en",
  });
}

export default async function EnglishHomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) query.append(key, item);
  }
  query.set("lang", "en");
  redirect(`/?${query}`);
}
