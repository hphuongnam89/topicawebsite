import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CmsPageView } from "@/components/cms/CmsPageView";
import { ProgramPageView } from "@/components/cms/ProgramPageView";
import { NavigationHub } from "@/components/cms/NavigationHub";
import { cms } from "@/lib/cms";
import { env } from "@/lib/env";
import { primaryNav } from "@/data/navigation";
import { getProgramDetail } from "@/data/program-details";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export const revalidate = 300;

function normalizePath(path: string): string {
  return `/${path.replace(/^\/+|\/+$/g, "")}`;
}

function findHub(path: string) {
  const normalized = normalizePath(path);
  return primaryNav.find((group) => normalizePath(group.href) === normalized);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = slug.join("/");

  const program = getProgramDetail(path);
  if (program) {
    return {
      title: `${program.officialName} – ${program.marketingLabel}`,
      description: program.summary,
      alternates: {
        canonical: `${env.NEXT_PUBLIC_SITE_URL}/${path}`,
      },
      openGraph: {
        title: `${program.officialName} – ${program.marketingLabel}`,
        description: program.summary,
        type: "website",
        locale: "vi_VN",
        url: `${env.NEXT_PUBLIC_SITE_URL}/${path}`,
      },
      twitter: {
        card: "summary",
        title: `${program.officialName} – ${program.marketingLabel}`,
        description: program.summary,
      },
    };
  }

  const page = await cms.getPageByPath(path).catch(() => null);

  if (page) {
    return {
      title: page.seo?.title || page.title,
      description: page.seo?.description || page.excerpt || undefined,
      alternates: {
        canonical: page.seo?.canonicalUrl || `${env.NEXT_PUBLIC_SITE_URL}/${path}`,
      },
    };
  }

  const hub = findHub(path);
  return hub
    ? {
        title: hub.label,
        alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}${normalizePath(hub.href)}` },
      }
    : {};
}

export default async function CmsRoutePage({ params }: Props) {
  const { slug } = await params;
  const path = slug.join("/");

  // Only programs with verified academic source data use the structured landing page.
  const program = getProgramDetail(path);
  if (program) {
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
