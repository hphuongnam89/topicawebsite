import * as React from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  ShieldCheck,
  Star,
  AlertTriangle,
} from "lucide-react";
import { cn } from "./cn";

export type StatusBadgeVariant =
  | "active"
  | "upcoming"
  | "closed"
  | "new"
  | "verified"
  | "featured"
  | "expired";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: StatusBadgeVariant;
  showIcon?: boolean;
}

interface StatusStyleConfig {
  bg: string;
  text: string;
  border: string;
  dotBg: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const variantStyles: Record<StatusBadgeVariant, StatusStyleConfig> = {
  active: {
    bg: "bg-success/10",
    text: "text-success",
    border: "border-success/25",
    dotBg: "bg-success",
    label: "Đang tuyển sinh",
    icon: CheckCircle2,
  },
  upcoming: {
    bg: "bg-info/10",
    text: "text-info",
    border: "border-info/25",
    dotBg: "bg-info",
    label: "Sắp mở",
    icon: Clock,
  },
  closed: {
    bg: "bg-ink-600/10",
    text: "text-ink-600",
    border: "border-ink-600/20",
    dotBg: "bg-ink-600",
    label: "Đã đóng",
    icon: XCircle,
  },
  new: {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/25",
    dotBg: "bg-warning",
    label: "Mới",
    icon: Sparkles,
  },
  verified: {
    bg: "bg-navy-900/10",
    text: "text-navy-900",
    border: "border-navy-900/20",
    dotBg: "bg-navy-900",
    label: "Đã kiểm định",
    icon: ShieldCheck,
  },
  featured: {
    bg: "bg-gold-500/15",
    text: "text-gold-900",
    border: "border-gold-500/30",
    dotBg: "bg-gold-600",
    label: "Nổi bật",
    icon: Star,
  },
  expired: {
    bg: "bg-ink-400/15",
    text: "text-ink-600",
    border: "border-ink-400/25",
    dotBg: "bg-ink-400",
    label: "Hết hạn",
    icon: AlertTriangle,
  },
};

export function StatusBadge({
  variant,
  showIcon = true,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  const style = variantStyles[variant];
  const IconComponent = style.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-0.5 text-[12px] leading-[18px] font-semibold tracking-wide transition-colors",
        style.bg,
        style.text,
        style.border,
        className,
      )}
      {...props}
    >
      {showIcon ? (
        <IconComponent className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <span
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", style.dotBg)}
          aria-hidden="true"
        />
      )}
      <span>{children || style.label}</span>
    </span>
  );
}
