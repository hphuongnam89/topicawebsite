import * as React from "react";
import { cn } from "./cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "brand" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantClasses = {
    default: "bg-paper text-ink-600",
    brand: "bg-brand-50 text-brand-700",
    outline: "border border-line-200 text-ink-600",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-[12px] leading-[18px] font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
