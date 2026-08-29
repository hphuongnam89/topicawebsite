import { cn } from "@/components/ui/cn";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export interface AdmissionBannerProps {
  heading: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  variant?: "dark" | "brand";
  className?: string;
}

export function AdmissionBanner({
  heading,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  variant = "dark",
  className,
}: AdmissionBannerProps) {
  const isDark = variant === "dark";

  return (
    <div
      className={cn(
        "py-16 text-center md:py-24",
        isDark ? "bg-ink-950 text-white" : "bg-brand-700 text-white",
        className,
      )}
    >
      <Container>
        <div className="max-w-measure mx-auto flex flex-col items-center">
          <h2 className="mb-6 font-display text-display md:text-h1">{heading}</h2>
          <p className="mb-8 text-body-lg opacity-90">{description}</p>
          <div className="flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row">
            <ButtonLink href={primaryHref} variant={isDark ? "primary" : "secondary"} size="lg">
              {primaryLabel}
            </ButtonLink>
            {secondaryHref && secondaryLabel && (
              <ButtonLink
                href={secondaryHref}
                variant="secondary"
                className={
                  isDark
                    ? "border-line-200 text-white hover:bg-white/10"
                    : "border-white/30 text-white hover:bg-white/10"
                }
                size="lg"
              >
                {secondaryLabel}
              </ButtonLink>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
