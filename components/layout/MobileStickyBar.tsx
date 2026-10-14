"use client";

import { LocalizedText } from "@/components/i18n/LocalizedText";
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
    let isInputFocused = false;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        isInputFocused = true;
        setVisible(false);
      }
    };

    const handleFocusOut = () => {
      isInputFocused = false;
      setVisible(window.scrollY > 300);
    };

    const handleScroll = () => {
      if (!isInputFocused) {
        setVisible(window.scrollY > 300);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  return (
    <div
      data-mobile-sticky-bar
      className={cn(
        "fixed right-0 bottom-0 left-0 z-40 border-t border-line-200 bg-canvas/95 backdrop-blur-md transition-transform duration-300 xl:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <ButtonLink
          href="/lien-he/"
          variant="secondary"
          size="default"
          className="min-h-[44px] flex-1 font-semibold"
        >
          <LocalizedText>Nhận tư vấn</LocalizedText>
        </ButtonLink>
        <ButtonLink
          href="https://www.tuyensinh.topicauni.edu.vn/"
          variant="accent"
          size="default"
          className="min-h-[44px] flex-1 font-bold"
          external
        >
          <LocalizedText>Đăng ký xét tuyển</LocalizedText>
        </ButtonLink>
      </div>
    </div>
  );
}
