"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

export type TrustMetric = {
  value: number | string;
  suffix?: string;
  label: string;
};

type TrustMetricsProps = {
  metrics: TrustMetric[];
  fallbackStatements: string[];
};

function CountUpValue({ value, suffix = "" }: Pick<TrustMetric, "value" | "suffix">) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const shouldReduceMotion = useReducedMotion();
  const isNumeric = typeof value === "number";
  const [displayValue, setDisplayValue] = useState(isNumeric && !shouldReduceMotion ? 0 : value);
  const formatter = new Intl.NumberFormat("vi-VN");

  useEffect(() => {
    if (!isNumeric || !inView || shouldReduceMotion) return;

    let frameId = 0;
    const duration = 500;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * easedProgress));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [inView, isNumeric, shouldReduceMotion, value]);

  const renderedValue = shouldReduceMotion ? value : displayValue;
  const visualValue =
    typeof renderedValue === "number" ? formatter.format(renderedValue) : renderedValue;
  const accessibleValue = typeof value === "number" ? formatter.format(value) : value;

  return (
    <span
      ref={ref}
      className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-ink-950 tabular-nums"
    >
      <span aria-hidden="true">
        {visualValue}
        {suffix}
      </span>
      <span className="sr-only">
        {accessibleValue}
        {suffix}
      </span>
    </span>
  );
}

export function TrustMetrics({ metrics, fallbackStatements }: TrustMetricsProps) {
  const hasVerifiedMetrics = metrics.length > 0;
  const items = hasVerifiedMetrics ? metrics : fallbackStatements;

  return (
    <section
      aria-label={hasVerifiedMetrics ? "Dấu ấn của Topica" : "Cam kết trải nghiệm học tập"}
      className="mt-6 rounded-[1.5rem] border border-line-200 bg-elevated px-6 py-3 sm:px-8 lg:px-10"
    >
      <div className="grid min-w-0 divide-y divide-line-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        {items.map((item, index) => {
          const metric = typeof item === "string" ? null : item;
          const label = typeof item === "string" ? item : item.label;

          return (
            <div
              key={label}
              className={`flex min-w-0 flex-col justify-center gap-2 py-5 sm:px-6 ${index === 0 ? "sm:pl-0" : ""} ${index === items.length - 1 ? "sm:pr-0" : ""}`}
            >
              {metric ? (
                <CountUpValue value={metric.value} suffix={metric.suffix} />
              ) : (
                <span className="text-body-sm font-semibold tracking-[0.08em] text-brand-700 uppercase">
                  Cam kết
                </span>
              )}
              <p className="text-body-sm font-medium text-ink-800">{label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
