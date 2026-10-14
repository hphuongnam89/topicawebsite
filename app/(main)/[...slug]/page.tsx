import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CmsPageView } from "@/components/cms/CmsPageView";
import { ProgramPageView } from "@/components/cms/ProgramPageView";
import { NavigationHub } from "@/components/cms/NavigationHub";
import { cms } from "@/lib/cms";
import { env } from "@/lib/env";
import { primaryNav } from "@/data/navigation";
import { getProgramDetail } from "@/data/program-details";
import { PROGRAM_ID_MAP, getProgramById } from "@/data/programs";
import { getLiveProgramDetail, isKnownProgramPath } from "@/lib/services/public-site";

import { buildLocalizedMetadata, resolveRequestLocale } from "@/lib/i18n/metadata";

type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const revalidate = 300;

const BLOCKED_SLUGS = new Set(["cart", "checkout", "my-account", "shop", "classic-shop"]);

function normalizePath(path: string): string {
  return `/${path.replace(/^\/+|\/+$/g, "")}`;
}

function findHub(path: string) {
  const normalized = normalizePath(path);
  return primaryNav.find((group) => normalizePath(group.href) === normalized);
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug[0] && BLOCKED_SLUGS.has(slug[0].toLowerCase())) {
    return {};
  }
  const path = slug.join("/");
  const locale = await resolveRequestLocale(searchParams);

  const mappedProgramId = PROGRAM_ID_MAP[path];
  const program = getLiveProgramDetail(path);

  if (program) {
    const enPath = mappedProgramId ? `/en/programs/${mappedProgramId}` : `/en/${program.slug}`;
    const viPath = `/${program.slug}`;
    return buildLocalizedMetadata({
      locale,
      title: `${program.officialName} – ${program.marketingLabel}`,
      description: program.summary,
      viPath,
      enPath,
      twitter: { card: "summary" },
    });
  }

  const page = await cms.getPageByPath(path).catch(() => null);

  if (page) {
    return buildLocalizedMetadata({
      locale,
      title: page.seo?.title || page.title,
      description: page.seo?.description || page.excerpt || undefined,
      viPath: `/${path}`,
      enPath: `/en/${path}`,
    });
  }

  const hub = findHub(path);
  return hub
    ? buildLocalizedMetadata({
        locale,
        title: hub.label,
        viPath: normalizePath(hub.href),
        enPath: `/en${normalizePath(hub.href)}`,
      })
    : {};
}

export default async function CmsRoutePage({ params }: Props) {
  const { slug } = await params;
  if (slug[0] && BLOCKED_SLUGS.has(slug[0].toLowerCase())) {
    notFound();
  }
  const path = slug.join("/");

  // Redirect legacy program aliases to canonical program URL (Task R07)
  const mappedProgramId = PROGRAM_ID_MAP[path];
  if (isKnownProgramPath(path) && !getLiveProgramDetail(path)) notFound();
  if (mappedProgramId) {
    const canonicalProgram = getProgramById(mappedProgramId);
    if (canonicalProgram && path !== canonicalProgram.slug) {
      redirect(`/${canonicalProgram.slug}/`);
    }
  }

  // Only programs with verified academic source data use the structured landing page.
  const program = getLiveProgramDetail(path);
  if (program) {
    if (path !== program.slug) {
      redirect(`/${program.slug}/`);
    }
    return <ProgramPageView program={program} />;
  }

  const page = await cms.getPageByPath(path).catch(() => null);

  if (page) {
    const parentGroup = primaryNav.find((group) =>
      group.columns.some((column) =>
        column.items.some((item) => item.href && normalizePath(item.href) === normalizePath(path)),
      ),
    );
    return (
      <CmsPageView
        page={page}
        parent={parentGroup ? { label: parentGroup.label, href: parentGroup.href } : undefined}
      />
    );
  }

  const hub = findHub(path);
  if (hub) return <NavigationHub group={hub} />;

  // Fallback: If it's a post served at a non-standard path, redirect it to the proper news URL
  const lastSlug = slug[slug.length - 1];
  if (lastSlug) {
    const article = await cms.getArticleBySlug(lastSlug).catch(() => null);
    if (article) {
      redirect(`/tin-tuc/${article.slug}`);
    }
  }

  notFound();
}
