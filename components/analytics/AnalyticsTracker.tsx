"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function TrackerLogic() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    
    // Ignore admin routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    // Report page view
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    
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

  return null;
}

export function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerLogic />
    </Suspense>
  );
}
