"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, ChevronUp } from "lucide-react";
import { contactInfo } from "@/data/campuses";
import { cn } from "@/components/ui/cn";

export function FloatingActions() {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      data-floating-actions
      className="fixed right-6 bottom-6 z-50 hidden flex-col items-center gap-4 lg:flex"
    >
      {/* Mail */}
      <a
        href={`mailto:${contactInfo.email}`}
        aria-label="Gửi email"
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-service-mail)] text-white shadow-lg transition-[opacity,transform] hover:opacity-90 active:translate-y-px"
      >
        <Mail className="relative z-10 h-5 w-5" />
      </a>

      {/* Facebook */}
      <a
        href="https://m.me/topica.edu.vn"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook Messenger"
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-service-messenger)] text-white shadow-lg transition-[opacity,transform] hover:opacity-90 active:translate-y-px"
      >
        <svg
          className="relative z-10 h-5 w-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>

      {/* Phone */}
      <a
        href={`tel:${contactInfo.phone.replace(/\./g, "")}`}
        aria-label="Gọi điện thoại"
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-service-phone)] text-white shadow-lg transition-[opacity,transform] hover:opacity-90 active:translate-y-px"
      >
        <Phone className="relative z-10 h-5 w-5" />
      </a>

      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        aria-label="Trở về đầu trang"
        className={cn(
          "mt-2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-500 bg-white text-brand-500 shadow-md transition-[color,background-color,transform,opacity] hover:bg-brand-50 active:translate-y-px",
          showTopBtn ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0",
        )}
      >
        <ChevronUp className="h-6 w-6" />
      </button>
    </div>
  );
}
