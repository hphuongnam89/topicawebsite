"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { primaryNav, actionItems } from "@/data/navigation";
import { cn } from "@/components/ui/cn";
import { Button, ButtonLink } from "@/components/ui/Button";
import { MegaMenu } from "./MegaMenu";
import { MobileNav } from "./MobileNav";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mega menu on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenuId(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mega menu when clicking outside header
  useEffect(() => {
    if (!openMenuId) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleMenuEnter = useCallback((id: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenMenuId(id);
  }, []);

  const handleMenuLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenMenuId(null);
    }, 150);
  }, []);

  const handleMenuToggle = useCallback((id: string) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  }, []);

  const applyAction = actionItems.find((a) => a.id === "apply");

  return (
    <>
      {/* Skip link */}
      <a
        href="#main-content"
        className="fixed top-4 left-4 z-[100] -translate-y-20 rounded-md bg-brand-700 px-4 py-2 text-body-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        Chuyển đến nội dung chính
      </a>

      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 right-0 left-0 z-50 w-full border-b transition-all duration-[var(--duration-slow)]",
          scrolled
            ? "border-brand-600 bg-brand-500/95 shadow-sm backdrop-blur-md"
            : "border-transparent bg-brand-500",
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-[var(--width-container)] items-center justify-between px-4 transition-[height] duration-[var(--duration-slow)] sm:px-6 lg:px-8",
            scrolled
              ? "h-[var(--height-header-compact)]"
              : "h-[var(--height-header-compact)] lg:h-[var(--height-header)]",
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="relative shrink-0 transition-[width,height] duration-[var(--duration-slow)]"
            aria-label="Topica - Trang chủ"
          >
            <Image
              src="/topica-logo.png"
              alt="Viện Đào tạo Quốc tế Topica"
              width={256}
              height={86}
              priority
              className={cn(
                "w-auto object-contain transition-[height] duration-[var(--duration-slow)]",
                scrolled ? "h-10" : "h-14 lg:h-16",
              )}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 xl:flex" aria-label="Điều hướng chính">
            {primaryNav.map((group) => (
              <div
                key={group.id}
                className="relative"
                onMouseEnter={() => handleMenuEnter(group.id)}
                onMouseLeave={handleMenuLeave}
              >
                <button
                  onClick={() => handleMenuToggle(group.id)}
                  aria-expanded={openMenuId === group.id}
                  aria-haspopup="true"
                  className={cn(
                    "rounded-md px-4 py-2.5 text-[15px] leading-5 font-semibold transition-colors duration-[var(--duration-base)]",
                    openMenuId === group.id
                      ? "bg-black/10 text-white"
                      : "text-white/95 hover:bg-black/10 hover:text-white",
                  )}
                >
                  {group.label}
                </button>

                {openMenuId === group.id && group.columns.length > 0 && (
                  <MegaMenu
                    columns={group.columns}
                    onClose={() => setOpenMenuId(null)}
                    onMouseEnter={() => handleMenuEnter(group.id)}
                    onMouseLeave={handleMenuLeave}
                  />
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {applyAction?.href && (
              <ButtonLink
                href={applyAction.href}
                external={applyAction.external}
                size="default"
                className="hidden sm:inline-flex bg-white text-brand-700 hover:bg-white/90 shadow-sm"
              >
                {applyAction.label}
              </ButtonLink>
            )}

            {/* Mobile menu button */}
            <Button
              variant="icon"
              size="sm"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu"
              aria-expanded={mobileOpen}
              className="xl:hidden text-white hover:bg-black/10 hover:text-white"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Header spacer to prevent content jumping under fixed header */}
      <div
        className={cn(
          "transition-[height] duration-[var(--duration-slow)]",
          scrolled
            ? "h-[var(--height-header-compact)]"
            : "h-[var(--height-header-compact)] lg:h-[var(--height-header)]",
        )}
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer */}
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
