import React from "react";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs, BreadcrumbItem } from "./Breadcrumbs";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs: BreadcrumbItem[];
}

export function PageHeader({ title, subtitle, breadcrumbs }: PageHeaderProps) {
  return (
    <section className="border-b border-line-200 bg-canvas py-12 lg:py-16">
      <Container>
        <ScrollReveal>
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl lg:text-h1">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-3xl font-sans text-body-lg text-ink-600">{subtitle}</p>
          )}
        </ScrollReveal>
      </Container>
    </section>
  );
}
