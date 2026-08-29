import type { CmsPage } from "@/lib/cms";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { WordPressContent } from "./WordPressContent";
import Image from "next/image";
import { AdmissionCTA } from "@/components/sections/AdmissionCTA";
import { CredentialSamples } from "./CredentialSamples";
import { FacilitiesDirectory } from "./FacilitiesDirectory";

interface CmsPageViewProps {
  page: CmsPage;
  parent?: { label: string; href: string };
  showAdmissionCTA?: boolean;
}

export function CmsPageView({ page, parent, showAdmissionCTA = true }: CmsPageViewProps) {
  const hasCredentialSamples = page.slug === "cong-khai-van-bang-chung-chi";
  const hasFacilities = page.slug === "co-so-vat-chat";

  return (
    <>
      <PageHeader
        title={page.title}
        subtitle={page.excerpt || undefined}
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          ...(parent ? [parent] : []),
          { label: page.title },
        ]}
      />

      <section className={`cms-content cms-content--${page.slug} bg-canvas py-12 sm:py-16 lg:py-20`}>
        <Container size="default">
          {page.featuredImage && (
            <figure className="mb-12 overflow-hidden rounded-xl">
              <div className="relative aspect-[16/9] w-full shadow-sm">
                <Image
                  src={page.featuredImage.url}
                  alt={page.featuredImage.alt || page.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            </figure>
          )}

          {page.contentHtml ? (
            <div className="mx-auto max-w-4xl">
              <WordPressContent html={page.contentHtml} />
            </div>
          ) : hasCredentialSamples ? (
            <CredentialSamples />
          ) : hasFacilities ? (
            <FacilitiesDirectory />
          ) : (
            <p className="text-center text-body text-ink-600 italic">
              Nội dung đang được cập nhật.
            </p>
          )}
        </Container>
      </section>
      {showAdmissionCTA && <AdmissionCTA />}
    </>
  );
}
