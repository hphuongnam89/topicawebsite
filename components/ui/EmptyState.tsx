import { LocalizedText } from "@/components/i18n/LocalizedText";
import * as React from "react";
import { SearchX } from "lucide-react";
import { cn } from "./cn";
import { ButtonLink } from "./Button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  secondaryActionHref?: string;
  secondaryActionLabel?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionHref = "/nganh-dao-tao/",
  actionLabel = "Khám phá các ngành đào tạo",
  secondaryActionHref = "/",
  secondaryActionLabel = "Về trang chủ",
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-line-200 bg-surface-subtle p-8 text-center sm:p-12",
        className,
      )}
      role="status"
      {...props}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-paper text-navy-800 shadow-xs mb-4">
        <LocalizedText>{icon || <SearchX className="h-7 w-7 text-navy-800" aria-hidden="true" />}</LocalizedText>
      </div>
      <h3 className="font-serif text-h3 font-bold text-ink-950 sm:text-2xl">
        <LocalizedText>{title}</LocalizedText>
      </h3>
      <LocalizedText>{description && (
        <p className="mt-2 max-w-md text-body-sm text-ink-600 leading-relaxed sm:text-body">
          <LocalizedText>{description}</LocalizedText>
        </p>
      )}</LocalizedText>
      <LocalizedText>{(actionHref || secondaryActionHref) && (
        <div className="mt-6 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
          <LocalizedText>{actionHref && actionLabel && (
            <ButtonLink href={actionHref} variant="primary" size="default" className="w-full justify-center">
              <LocalizedText>{actionLabel}</LocalizedText>
            </ButtonLink>
          )}</LocalizedText>
          <LocalizedText>{secondaryActionHref && secondaryActionLabel && (
            <ButtonLink href={secondaryActionHref} variant="outline" size="default" className="w-full justify-center">
              <LocalizedText>{secondaryActionLabel}</LocalizedText>
            </ButtonLink>
          )}</LocalizedText>
        </div>
      )}</LocalizedText>
    </div>
  );
}
