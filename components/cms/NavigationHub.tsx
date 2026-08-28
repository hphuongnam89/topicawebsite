import Link from "next/link";
import type { NavGroup } from "@/data/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";

export function NavigationHub({ group }: { group: NavGroup }) {
  return (
    <>
      <PageHeader
        title={group.label}
        breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: group.label }]}
      />
      <section className="bg-canvas py-12 sm:py-16 lg:py-20">
        <Container>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {group.columns.map((column) => (
              <section key={column.heading} aria-labelledby={`hub-${group.id}-${column.heading}`}>
                <h2
                  id={`hub-${group.id}-${column.heading}`}
                  className="mb-4 font-display text-h3 text-ink-950"
                >
                  {column.heading}
                </h2>
                <ul className="divide-y divide-line-100 border-y border-line-100">
                  {column.items.map((item) =>
                    item.href ? (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="block py-3 font-semibold text-ink-800 transition-colors hover:text-brand-700"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ) : null,
                  )}
                </ul>
              </section>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
