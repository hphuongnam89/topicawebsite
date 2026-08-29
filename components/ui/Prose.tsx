import * as React from "react";
import { cn } from "./cn";

export interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Raw HTML content to render */
  html?: string;
  /** Whether to use the wider editorial measure */
  wide?: boolean;
}

/**
 * Editorial typography wrapper for long-form content.
 * Optimized for Vietnamese reading with proper line-height, paragraph spacing,
 * and heading hierarchy. Max-width is 760px (--width-measure) by default.
 *
 * Can be used either with `html` prop (dangerouslySetInnerHTML) or with children.
 */
export function Prose({ html, wide = false, className, children, ...props }: ProseProps) {
  const classes = cn(
    "prose-editorial",
    !wide && "max-w-[var(--width-measure)]",
    className,
  );

  if (html) {
    return (
      <div
        className={classes}
        dangerouslySetInnerHTML={{ __html: html }}
        {...props}
      />
    );
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
