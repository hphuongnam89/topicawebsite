import { cn } from "@/components/ui/cn";
import { Container } from "@/components/ui/Container";

interface ArticleLayoutProps {
  children: React.ReactNode;
  toc?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export function ArticleLayout({ children, toc, sidebar, className }: ArticleLayoutProps) {
  return (
    <Container className={cn("py-8 md:py-12", className)}>
      <div className="items-start lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16">
        {/* Main Content */}
        <main className="min-w-0 lg:col-span-8 xl:col-span-8 2xl:col-span-9">{children}</main>

        {/* Sidebar */}
        <aside className="mt-12 space-y-8 lg:col-span-4 lg:mt-0 xl:col-span-4 2xl:col-span-3">
          {toc}
          {sidebar}
        </aside>
      </div>
    </Container>
  );
}
