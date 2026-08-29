import * as React from "react";
import { cn } from "./cn";
import { Container, type ContainerProps } from "./Container";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Visual background variant */
  variant?: "default" | "paper" | "dark" | "brand";
  /** Container size passed through to Container */
  containerSize?: ContainerProps["size"];
  /** Whether to use a container wrapper */
  contained?: boolean;
  /** HTML element to render */
  as?: "section" | "div" | "aside";
}

const variantStyles: Record<NonNullable<SectionProps["variant"]>, string> = {
  default: "bg-canvas text-ink-800",
  paper: "bg-paper text-ink-800",
  dark: "bg-ink-950 text-white",
  brand: "bg-brand-500 text-white",
};

export function Section({
  variant = "default",
  containerSize = "default",
  contained = true,
  as: Component = "section",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Component
      className={cn(
        "py-16 lg:py-24",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {contained ? (
        <Container size={containerSize}>{children}</Container>
      ) : (
        children
      )}
    </Component>
  );
}
