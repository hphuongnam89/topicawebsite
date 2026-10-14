import { LocalizedText } from "@/components/i18n/LocalizedText";
import * as React from "react";
import { cn } from "./cn";

export type BadgeVariant =
  "default" | "brand" | "navy" | "outline" | "success" | "warning" | "error" | "info";

export type BadgeSize = "sm" | "default";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

export function Badge({
  className,
  variant = "default",
  size = "default",
  icon,
  children,
  ...props
}: BadgeProps) {
  const variantClasses: Record<BadgeVariant, string> = {
    default: "bg-paper text-ink-800 border border-line-200",
    brand: "bg-gold-50 text-gold-900 border border-gold-300 font-semibold",
    navy: "bg-navy-50 text-navy-900 border border-navy-200 font-semibold",
    outline: "border border-line-300 text-ink-700 bg-transparent",
    success: "bg-success/10 text-success border border-success/20 font-medium",
    warning: "bg-warning/10 text-warning border border-warning/20 font-medium",
    error: "bg-error/10 text-error border border-error/20 font-medium",
    info: "bg-info/10 text-info border border-info/20 font-medium",
  };

  const sizeClasses: Record<BadgeSize, string> = {
    sm: "px-2 py-0.5 text-[11px] leading-[16px]",
    default: "px-2.5 py-1 text-[12px] leading-[18px]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm font-sans font-medium transition-colors",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <LocalizedText>
        {icon && (
          <span className="shrink-0">
            <LocalizedText>{icon}</LocalizedText>
          </span>
        )}
      </LocalizedText>
      <LocalizedText>{children}</LocalizedText>
    </div>
  );
}
