import * as React from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive" | "icon";
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
    primary: "bg-brand-700 text-white hover:bg-brand-800 active:translate-y-px",
    secondary: "border border-ink-950 bg-transparent text-ink-950 hover:bg-brand-50",
    tertiary: "text-ink-950 hover:text-brand-700",
    destructive: "bg-error text-white hover:bg-error/90",
    icon: "bg-transparent text-ink-950 hover:bg-brand-50",
  };
  const sizes: Record<ButtonSize, string> = {
    sm: variant === "icon" ? "h-10 w-10 p-0" : "h-10 px-4 text-body-sm",
    default: variant === "icon" ? "h-12 w-12 p-0" : "h-12 px-5 text-body-sm",
    lg: variant === "icon" ? "h-[52px] w-[52px] p-0" : "h-[52px] px-6 text-body",
  };

  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md font-sans font-semibold transition-[color,background-color,border-color,transform,opacity] duration-[var(--duration-base)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info",
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
