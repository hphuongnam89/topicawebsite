import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { homepageContent } from "@/data/homepage-content";

export function HomepageFAQ() {
  return (
    <section className="bg-paper py-16 sm:py-20 lg:py-24" aria-labelledby="homepage-faq-title">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="text-body-sm font-semibold tracking-[0.14em] text-brand-700 uppercase">
              Giải đáp trước khi đăng ký
            </p>
            <h2
              id="homepage-faq-title"
              className="mt-4 max-w-[10ch] font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.08] font-semibold text-ink-950"
            >
              Câu hỏi thường gặp
            </h2>
            <p className="mt-5 max-w-[35ch] text-body text-ink-600">
              Những thông tin quan trọng được trình bày theo nguồn chính thức và phạm vi áp dụng của
              từng thông báo.
            </p>
            <ButtonLink
              href="#consultation-form"
              className="mt-7"
              data-track="eligibility_check_click"
            >
              {homepageContent.hero.primaryCta}
            </ButtonLink>
          </div>
          <div className="divide-y divide-line-200 border-y border-line-200">
            {homepageContent.faqs.map(([question, answer]) => (
              <details key={question} className="group py-5">
                <summary
                  className="flex cursor-pointer list-none items-center justify-between gap-5 text-left font-semibold text-ink-950 marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-info"
                  data-track="faq_open"
                  data-track-label={question}
                >
                  <span className="text-body-lg">{question}</span>
                  <span
                    className="text-2xl leading-none text-brand-700 transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-[62ch] pt-4 text-body text-ink-600">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
