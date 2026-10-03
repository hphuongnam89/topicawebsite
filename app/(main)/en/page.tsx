import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Topica International Institute",
  description: "Flexible online degree programs at Topica International Institute.",
};

export default function EnglishHomePage() {
  return (
    <main className="bg-canvas py-20 sm:py-28">
      <Container>
        <div className="max-w-3xl">
          <p className="text-body-sm font-semibold tracking-[0.14em] text-brand-700 uppercase">
            Topica International Institute
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,5rem)] leading-tight text-ink-950">
            Flexible online degrees for your next step.
          </h1>
          <p className="mt-6 max-w-2xl text-body-lg text-ink-600">
            Explore online learning programs, admissions information, and support from Topica.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/quan-tri-kinh-doanh-marketing/"
              className="rounded-md bg-brand-700 px-5 py-3 font-semibold text-white hover:bg-brand-800"
            >
              Business Administration
            </Link>
            <Link
              href="/tuyen-sinh/hoc-phi-hoc-bong/"
              className="rounded-md border border-brand-700 px-5 py-3 font-semibold text-brand-700 hover:bg-brand-50"
            >
              Tuition & scholarships
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
