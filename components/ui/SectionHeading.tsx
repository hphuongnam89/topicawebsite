import * as React from "react";
import { cn } from "./cn";

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children?: React.ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  as?: "h2" | "h3";
}

export function SectionHeading({
  title,
  children,
  subtitle,
  align = "left",
  as: Component = "h2",
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(align === "center" && "mx-auto max-w-[47.5rem] text-center", className)}
      {...props}
    >
      <Component className="font-display text-h2 font-bold text-ink-950">
        {title ?? children}
      </Component>
      {align === "center" && <div aria-hidden="true" className="mx-auto mt-4 h-[3px] w-12 bg-brand-500" />}
      {subtitle && <p className="mt-3 font-sans text-body-lg text-ink-600">{subtitle}</p>}
    </div>
  );
}
