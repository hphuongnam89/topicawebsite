import * as React from "react";
import { cn } from "./cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "brand" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantClasses = {
    default: "bg-paper text-ink-700 border border-line-200",
    brand: "bg-gold-50 text-navy-900 border border-gold-300 font-semibold",
    outline: "border border-line-300 text-ink-700",
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
