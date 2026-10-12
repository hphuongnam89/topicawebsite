"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, ChevronUp } from "lucide-react";
import { contactChannels as defaultChannels } from "@/data/campuses";
import type { ContactChannels } from "@/lib/services/public-site";
import { cn } from "@/components/ui/cn";

export function FloatingActions({
  channels: contactChannels = defaultChannels,
}: { channels?: ContactChannels } = {}) {
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
      className="fixed bottom-6 right-6 z-40 hidden flex-col items-center gap-3 transition-[bottom] duration-200 lg:flex"
    >
      {/* Mail */}
      <a
        href={contactChannels.admissionsEmail.href}
        aria-label={`Gửi email tư vấn tuyển sinh (${contactChannels.admissionsEmail.value})`}
        title={`Email tuyển sinh: ${contactChannels.admissionsEmail.value}`}
        className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-line-200 bg-white text-navy-800 shadow-card transition-all hover:border-navy-400 hover:shadow-card-hover active:translate-y-px"
      >
        <Mail className="relative z-10 h-5 w-5" />
      </a>

      {/* Facebook */}
      <a
        href="https://m.me/topica.edu.vn"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook Messenger"
        title="Nhắn tin qua Facebook Messenger"
        className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-line-200 bg-white text-navy-800 shadow-card transition-all hover:border-navy-400 hover:shadow-card-hover active:translate-y-px"
      >
        <svg
          className="relative z-10 h-5 w-5 fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>

      {/* Phone (Primary Hotline) */}
      <a
        href={contactChannels.admissionsHotline.href}
        aria-label={`Gọi hotline tư vấn (${contactChannels.admissionsHotline.value})`}
        title={`Hotline tư vấn: ${contactChannels.admissionsHotline.value}`}
        className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-gold-400 bg-navy-900 text-gold-400 shadow-card transition-all hover:border-gold-300 hover:bg-navy-800 hover:shadow-card-hover active:translate-y-px"
      >
        <Phone className="relative z-10 h-5 w-5" />
      </a>

      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        aria-label="Trở về đầu trang"
        className={cn(
          "mt-1 flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold-500 bg-white text-gold-600 shadow-md transition-[color,background-color,transform,opacity] hover:bg-gold-50 hover:text-navy-900 active:translate-y-px",
          showTopBtn ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0",
        )}
      >
        <ChevronUp className="h-6 w-6" />
      </button>
    </div>
  );
}
