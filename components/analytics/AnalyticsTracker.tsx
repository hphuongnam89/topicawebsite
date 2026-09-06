"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent, type AnalyticsEventName } from "@/lib/analytics";

function TrackerLogic() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    // Ignore admin routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    // Report page view
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    trackEvent("page_view", { path: pathname });
    fetch("/api/public/hit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: url }),
      // use keepalive to ensure request completes even if user navigates away
      keepalive: true,
    }).catch(() => {
      // Ignore analytics errors
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    const seen = new Set<number>();
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      for (const depth of [25, 50, 75, 90]) {
        if (!seen.has(depth) && (window.scrollY / max) * 100 >= depth) {
          seen.add(depth);
          trackEvent(`scroll_depth_${depth}` as AnalyticsEventName, { depth });
        }
      }
    };
    const onClick = (event: MouseEvent) => {
      const target =
        event.target instanceof Element ? event.target.closest<HTMLElement>("[data-track]") : null;
      if (!target) return;
      const name = target?.dataset.track as AnalyticsEventName | undefined;
      if (name)
        trackEvent(name, target.dataset.trackLabel ? { label: target.dataset.trackLabel } : {});
    };
    const onFormFocus = () => trackEvent("form_start");
    document.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    document.querySelector("#lead-form")?.addEventListener("focusin", onFormFocus, { once: true });
    return () => {
      document.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      document.querySelector("#lead-form")?.removeEventListener("focusin", onFormFocus);
    };
  }, []);

  return null;
}

export function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerLogic />
    </Suspense>
  );
}
