import * as React from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "./cn";

export type ButtonVariant =
  | "primary"
  | "navy"
  | "accent"
  | "gold"
  | "secondary"
  | "outline"
  | "tertiary"
  | "ghost"
  | "destructive"
  | "icon";
export type ButtonSize = "sm" | "default" | "lg";

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function buttonStyles({
  variant = "primary",
  size = "default",
  loading = false,
  disabled = false,
  className,
}: ButtonStyleOptions = {}): string {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950 active:translate-y-px font-semibold shadow-xs focus-visible:outline-navy-900",
    navy:
      "bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950 active:translate-y-px font-semibold shadow-xs focus-visible:outline-navy-900",
    accent:
      "bg-gold-500 text-navy-950 hover:bg-gold-600 active:bg-gold-700 active:translate-y-px font-semibold shadow-xs focus-visible:outline-gold-500",
    gold:
      "bg-gold-500 text-navy-950 hover:bg-gold-600 active:bg-gold-700 active:translate-y-px font-semibold shadow-xs focus-visible:outline-gold-500",
    secondary:
      "border-2 border-navy-900 bg-transparent text-navy-900 hover:bg-navy-50 active:translate-y-px font-semibold focus-visible:outline-navy-900",
    outline:
      "border border-line-200 bg-canvas text-ink-800 hover:border-navy-700 hover:bg-paper active:translate-y-px font-medium focus-visible:outline-navy-900",
    tertiary:
      "text-navy-900 hover:text-gold-700 underline-offset-4 hover:underline font-medium focus-visible:outline-navy-900",
    ghost:
      "bg-transparent text-navy-900 hover:bg-navy-50 hover:text-navy-900 font-medium focus-visible:outline-navy-900",
    destructive:
      "bg-error text-white hover:bg-error/90 active:bg-error/95 font-semibold focus-visible:outline-error",
    icon:
      "bg-transparent text-navy-900 hover:bg-navy-50 focus-visible:outline-navy-900",
  };
  const sizes: Record<ButtonSize, string> = {
    sm: variant === "icon" ? "h-9 w-9 p-0" : "h-9 px-4 text-body-sm",
    default: variant === "icon" ? "h-11 w-11 p-0" : "h-11 px-5 text-body-sm",
    lg: variant === "icon" ? "h-12 w-12 p-0" : "h-12 px-6 text-body",
  };

  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md font-sans transition-[color,background-color,border-color,transform,opacity,box-shadow] duration-[var(--duration-base)] focus-visible:outline-2 focus-visible:outline-offset-2",
    variant === "tertiary" && "group",
    variants[variant],
    sizes[size],
    (disabled || loading) && "pointer-events-none cursor-not-allowed opacity-55",
    className,
  );
}

interface ButtonContentProps {
  children: React.ReactNode;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: ButtonVariant;
}

function ButtonContent({
  children,
  loading = false,
  leftIcon,
  rightIcon,
  variant = "primary",
}: ButtonContentProps) {
  const isTertiary = variant === "tertiary";

  return (
    <>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
      {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && !isTertiary && <span className="ml-2">{rightIcon}</span>}
      {!loading && isTertiary && (
        <ArrowRight
          className="ml-1 h-4 w-4 transition-transform duration-[var(--duration-base)] group-hover:translate-x-[2px]"
          aria-hidden="true"
        />
      )}
    </>
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "default",
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonStyles({ variant, size, loading, disabled, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <ButtonContent loading={loading} leftIcon={leftIcon} rightIcon={rightIcon} variant={variant}>
        {children}
      </ButtonContent>
    </button>
  );
});

export interface ButtonLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  external?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  {
    href,
    className,
    variant = "primary",
    size = "default",
    external = /^https?:\/\//i.test(href),
    leftIcon,
    rightIcon,
    children,
    target,
    rel,
    ...props
  },
  ref,
) {
  const content = (
    <ButtonContent leftIcon={leftIcon} rightIcon={rightIcon} variant={variant}>
      {children}
    </ButtonContent>
  );
  const styles = buttonStyles({ variant, size, className });

  if (external) {
    return (
      <a
        ref={ref}
        href={href}
        className={styles}
        target={target ?? "_blank"}
        rel={rel ?? "noopener noreferrer"}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <Link ref={ref} href={href} className={styles} target={target} rel={rel} {...props}>
      {content}
    </Link>
  );
});

Button.displayName = "Button";
ButtonLink.displayName = "ButtonLink";
