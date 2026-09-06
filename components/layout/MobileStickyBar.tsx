"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";

/**
 * Mobile-only sticky bottom bar with admission CTAs.
 * Appears after scrolling past the hero area.
 * Respects iPhone safe area with env(safe-area-inset-bottom).
 */
export function MobileStickyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      data-mobile-sticky-bar
      className={cn(
        "fixed right-0 bottom-0 left-0 z-40 border-t border-line-200 bg-canvas/95 pb-safe-area backdrop-blur-md transition-transform duration-300 lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <ButtonLink
          href="#consultation-form"
          variant="primary"
          size="sm"
          className="flex-1"
          data-track="hero_primary_cta_click"
        >
          Kiểm tra hồ sơ
        </ButtonLink>
        <ButtonLink
          href="#programs"
          variant="secondary"
          size="sm"
          className="flex-1"
          data-track="hero_secondary_cta_click"
        >
          Xem 5 ngành
        </ButtonLink>
      </div>
    </div>
  );
}
