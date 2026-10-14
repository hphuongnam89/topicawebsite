"use client";

import { useEffect, Suspense } from "react";
import { usePathname } from "next/navigation";
import { safePublicPath } from "@/lib/analytics-path";

function TrackerLogic() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Ignore admin routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    // Report page view
    const url = safePublicPath(pathname);
    if (!url) return;

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
  }, [pathname]);

  useEffect(() => {
    const track = (eventName: "cta_click" | "search", button?: string) => {
      const pagePath = safePublicPath(window.location.pathname);
      if (!pagePath) return;
      void fetch("/api/public/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventName, pagePath, button }),
        keepalive: true,
      }).catch(() => {});
    };
    const click = (event: MouseEvent) => {
      const link =
        event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (href === "https://www.tuyensinh.topicauni.edu.vn/") track("cta_click", "admission");
      else if (href === "/lien-he/" || href === "#tu-van") track("cta_click", "consultation");
      else if (href.startsWith("tel:") || href.startsWith("mailto:")) track("cta_click", "contact");
    };
    document.addEventListener("click", click);
    if (pathname === "/tim-kiem") track("search");
    return () => document.removeEventListener("click", click);
  }, [pathname]);

  return null;
}

export function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerLogic />
    </Suspense>
  );
}
