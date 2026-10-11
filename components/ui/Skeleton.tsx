import * as React from "react";
import { cn } from "./cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-ink-400/15",
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2.5", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            "h-4",
            index === lines - 1 ? "w-3/5" : index === 0 ? "w-full" : "w-4/5",
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-line-200 bg-canvas p-5 space-y-4",
        className,
      )}
      aria-hidden="true"
    >
      <Skeleton className="aspect-[16/9] w-full rounded-md" />
      <Skeleton className="h-6 w-3/4 rounded-sm" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="pt-2 flex justify-between items-center">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function SkeletonButton({
  size = "default",
  className,
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-9 w-24",
    default: "h-11 w-32",
    lg: "h-12 w-40",
  };

  return (
    <Skeleton
      className={cn("rounded-md", sizeClasses[size], className)}
      aria-hidden="true"
    />
  );
}
