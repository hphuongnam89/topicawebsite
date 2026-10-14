import { LocalizedText } from "@/components/i18n/LocalizedText";
import * as React from "react";
import { cn } from "./cn";

export type CardVariant = "default" | "subtle" | "paper" | "elevated" | "flat";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant = "default", interactive = true, ...props },
  ref,
) {
  const variantStyles: Record<CardVariant, string> = {
    default: "border border-line-200 bg-canvas",
    subtle: "border border-line-200 bg-surface-subtle",
    paper: "border border-line-200 bg-paper",
    elevated: "border border-line-100 bg-canvas shadow-card",
    flat: "border-0 bg-surface-subtle",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "group overflow-hidden rounded-lg font-sans transition-[transform,box-shadow,border-color] duration-[var(--duration-base)]",
        variantStyles[variant],
        interactive && "hover:-translate-y-0.5 hover:border-line-300 hover:shadow-card-hover",
        className,
      )}
      {...props}
    />
  );
});

Card.displayName = "Card";

export interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  aspect?: string;
}

export function CardMedia({
  className,
  aspect = "aspect-[4/3]",
  children,
  ...props
}: CardMediaProps) {
  return (
    <div className={cn("relative overflow-hidden", aspect, className)} {...props}>
      <div className="h-full w-full transition-transform duration-[var(--duration-slow)] group-hover:scale-[1.03]">
        <LocalizedText>{children}</LocalizedText>
      </div>
    </div>
  );
}

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn("p-5 pb-2 sm:p-6 sm:pb-3", className)} {...props} />;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h2" | "h3" | "h4" | "h5" | "h6";
}

export function CardTitle({ className, as: Component = "h3", ...props }: CardTitleProps) {
  return (
    <Component
      className={cn(
        "font-serif text-h3 font-bold text-ink-950 transition-colors group-hover:text-navy-900",
        className,
      )}
      {...props}
    />
  );
}

export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p className={cn("mt-1.5 text-body-sm leading-relaxed text-ink-600", className)} {...props} />
  );
}

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("p-5 pt-0 sm:p-6 sm:pt-0", className)} {...props} />;
}

export type CardBodyProps = React.HTMLAttributes<HTMLDivElement>;

export function CardBody({ className, ...props }: CardBodyProps) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center px-5 pt-0 pb-5 text-body-sm text-ink-600 sm:px-6 sm:pb-6",
        className,
      )}
      {...props}
    />
  );
}
