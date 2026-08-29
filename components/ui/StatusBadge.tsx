import * as React from "react";
import { cn } from "./cn";

export type StatusBadgeVariant = "active" | "upcoming" | "closed" | "new";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: StatusBadgeVariant;
}

const variantStyles: Record<StatusBadgeVariant, { bg: string; text: string; label: string }> = {
  active: {
    bg: "bg-success/10",
    text: "text-success",
    label: "Đang tuyển sinh",
  },
  upcoming: {
    bg: "bg-info/10",
    text: "text-info",
    label: "Sắp mở",
  },
  closed: {
    bg: "bg-ink-600/10",
    text: "text-ink-600",
    label: "Đã đóng",
  },
  new: {
    bg: "bg-warning/10",
    text: "text-warning",
    label: "Mới",
  },
};

export function StatusBadge({ variant, className, children, ...props }: StatusBadgeProps) {
  const style = variantStyles[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[12px] leading-[18px] font-semibold",
        style.bg,
        style.text,
        className,
      )}
      {...props}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", {
          "bg-success": variant === "active",
          "bg-info": variant === "upcoming",
          "bg-ink-600": variant === "closed",
          "bg-warning": variant === "new",
        })}
        aria-hidden="true"
      />
      {children || style.label}
    </span>
  );
}
