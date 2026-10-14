import { LocalizedText } from "@/components/i18n/LocalizedText";
import * as React from "react";
import { cn } from "./cn";

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children?: React.ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  as?: "h2" | "h3";
  titleClassName?: string;
  subtitleClassName?: string;
}

export function SectionHeading({
  title,
  children,
  subtitle,
  align = "left",
  as: Component = "h2",
  titleClassName,
  subtitleClassName,
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(align === "center" && "mx-auto max-w-[47.5rem] text-center", className)}
      {...props}
    >
      <Component className={cn("font-display text-h2 font-bold text-ink-950", titleClassName)}>
        <LocalizedText>{title ?? children}</LocalizedText>
      </Component>
      {align === "center" && (
        <div aria-hidden="true" className="mx-auto mt-4 h-[3px] w-12 bg-brand-500" />
      )}
      <LocalizedText>
        {subtitle && (
          <p className={cn("mt-3 font-sans text-body-lg text-ink-600", subtitleClassName)}>
            <LocalizedText>{subtitle}</LocalizedText>
          </p>
        )}
      </LocalizedText>
    </div>
  );
}
