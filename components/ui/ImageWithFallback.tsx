"use client";

import { LocalizedText } from "@/components/i18n/LocalizedText";
import { LocalizedElement } from "@/components/i18n/LocalizedElement";
import * as React from "react";
import Image, { ImageProps } from "@/components/i18n/LocalizedImage";
import { GraduationCap } from "lucide-react";
import { cn } from "./cn";

export interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
  fallbackText?: string;
  aspectRatio?: "16/9" | "4/3" | "1/1" | "auto";
  containerClassName?: string;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc,
  fallbackText = "Topica Uni",
  aspectRatio = "auto",
  containerClassName,
  className,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = React.useState(false);

  const aspectClass = {
    "16/9": "aspect-[16/9]",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-square",
    auto: "",
  }[aspectRatio];

  if (!src || error) {
    if (fallbackSrc) {
      return (
        <div className={cn("relative overflow-hidden", aspectClass, containerClassName)}>
          <Image
            src={fallbackSrc}
            alt={alt}
            className={className}
            onError={() => setError(true)}
            {...props}
          />
        </div>
      );
    }

    return (
      <LocalizedElement
        as="div"
        className={cn(
          "flex h-full w-full flex-col items-center justify-center border border-line-200 bg-surface-subtle p-4 text-center text-ink-600",
          aspectClass,
          containerClassName,
        )}
        role="img"
        aria-label={alt}
      >
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-paper text-navy-800 shadow-xs">
          <GraduationCap className="h-6 w-6 text-navy-800" aria-hidden="true" />
        </div>
        <span className="text-body-sm font-medium text-ink-700">
          <LocalizedText>{fallbackText}</LocalizedText>
        </span>
      </LocalizedElement>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", aspectClass, containerClassName)}>
      <Image src={src} alt={alt} className={className} onError={() => setError(true)} {...props} />
    </div>
  );
}
