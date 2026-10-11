import * as React from "react";
import { Info, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "./cn";

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  icon?: React.ReactNode;
}

const variantConfig: Record<
  AlertVariant,
  {
    container: string;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    titleColor: string;
  }
> = {
  info: {
    container: "bg-navy-50/80 border-navy-200 text-navy-950",
    icon: Info,
    iconColor: "text-navy-700",
    titleColor: "text-navy-900",
  },
  success: {
    container: "bg-success/10 border-success/25 text-ink-950",
    icon: CheckCircle2,
    iconColor: "text-success",
    titleColor: "text-success",
  },
  warning: {
    container: "bg-warning/10 border-warning/25 text-ink-950",
    icon: AlertTriangle,
    iconColor: "text-warning",
    titleColor: "text-warning",
  },
  error: {
    container: "bg-error/10 border-error/25 text-ink-950",
    icon: AlertCircle,
    iconColor: "text-error",
    titleColor: "text-error",
  },
};

export function Alert({
  variant = "info",
  title,
  icon,
  children,
  className,
  ...props
}: AlertProps) {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3.5 rounded-lg border p-4 text-body-sm leading-relaxed",
        config.container,
        className,
      )}
      {...props}
    >
      <div className={cn("mt-0.5 shrink-0", config.iconColor)}>
        {icon || <IconComponent className="h-5 w-5" aria-hidden="true" />}
      </div>
      <div className="min-w-0 flex-1">
        {title && (
          <h4 className={cn("mb-1 font-semibold text-body", config.titleColor)}>
            {title}
          </h4>
        )}
        <div className="text-ink-800">{children}</div>
      </div>
    </div>
  );
}
