import type { CmsPage } from "@/lib/cms";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { WordPressContent } from "./WordPressContent";
import Image from "next/image";

interface CmsPageViewProps {
  page: CmsPage;
  parent?: { label: string; href: string };
}

export function CmsPageView({ page, parent }: CmsPageViewProps) {
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
      
      <section className="bg-canvas py-12 sm:py-16 lg:py-20">
        <Container size="narrow">
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
            <div className="prose-lg max-w-none">
              <WordPressContent html={page.contentHtml} />
            </div>
          ) : (
            <p className="text-body text-ink-600 text-center italic">Nội dung đang được cập nhật.</p>
          )}
        </Container>
      </section>
    </>
  );
}
