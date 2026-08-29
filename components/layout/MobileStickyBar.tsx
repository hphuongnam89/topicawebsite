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
        "fixed right-0 bottom-0 left-0 z-40 border-t border-line-200 bg-canvas/95 backdrop-blur-md transition-transform duration-300 lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <ButtonLink
          href="/lien-he/"
          variant="secondary"
          size="sm"
          className="flex-1"
        >
          Nhận tư vấn
        </ButtonLink>
        <ButtonLink
          href="https://www.tuyensinh.topicauni.edu.vn/"
          variant="primary"
          size="sm"
          className="flex-1"
          external
        >
          Đăng ký xét tuyển
        </ButtonLink>
      </div>
    </div>
  );
}
