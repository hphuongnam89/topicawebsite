"use client";

import { LocalizedText } from "@/components/i18n/LocalizedText";
import { LocalizedElement } from "@/components/i18n/LocalizedElement";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "@/components/i18n/LocalizedLink";
import Image from "@/components/i18n/LocalizedImage";
import { Menu, Search, X, Phone, Mail } from "lucide-react";
import { primaryNav, actionItems } from "@/data/navigation";
import { contactChannels as defaultChannels } from "@/data/campuses";
import type { ContactChannels } from "@/lib/services/public-site";
import { cn } from "@/components/ui/cn";
import { Button, ButtonLink } from "@/components/ui/Button";
import { MegaMenu } from "./MegaMenu";
import { MobileNav } from "./MobileNav";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({
  channels: contactChannels = defaultChannels,
}: { channels?: ContactChannels } = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenuId(null);
        setMobileOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!openMenuId && !searchOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target;
      const clickedSearch = target instanceof Element && target.closest("#header-search");
      const clickedSearchToggle =
        target instanceof Element && target.closest('[aria-controls="header-search"]');

      if (!clickedSearch && !clickedSearchToggle) {
        setSearchOpen(false);
      }

      if (headerRef.current && !headerRef.current.contains(target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId, searchOpen]);

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
        className="fixed top-4 left-4 z-[100] -translate-y-20 rounded-md bg-navy-900 px-4 py-2 text-body-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        <LocalizedText>Chuyển đến nội dung chính</LocalizedText>
      </a>

      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 right-0 left-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-[var(--duration-slow)]",
          "bg-navy-900 text-white",
        )}
      >
        {/* Utility Bar */}
        <div className="border-b border-white/10">
          <div className="mx-auto flex max-w-[var(--width-container)] items-center justify-between px-4 py-2 text-xs sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 sm:gap-4">
              <LocalizedElement
                as="a"
                href={contactChannels.admissionsHotline.href}
                className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 text-white/75 transition-colors hover:text-white sm:min-h-6 sm:min-w-0"
                title={contactChannels.admissionsHotline.label}
              >
                <Phone className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
                <span className="hidden sm:inline">
                  <LocalizedText>Hotline: </LocalizedText>
                  <LocalizedText>{contactChannels.admissionsHotline.value}</LocalizedText>
                </span>
              </LocalizedElement>
              <LocalizedElement
                as="a"
                href={contactChannels.admissionsEmail.href}
                className="hidden min-h-6 items-center gap-1.5 text-white/75 transition-colors hover:text-white lg:flex"
                title={contactChannels.admissionsEmail.label}
              >
                <Mail className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
                <span className="hidden lg:inline">
                  <LocalizedText>{contactChannels.admissionsEmail.value}</LocalizedText>
                </span>
              </LocalizedElement>
            </div>
            <div className="flex items-center gap-2.5 text-white/75 sm:gap-4">
              <Link
                href="/he-thong/"
                className="flex min-h-11 items-center transition-colors hover:text-white sm:min-h-6"
              >
                <LocalizedText>Cổng Elearning</LocalizedText>
              </Link>
              <span className="text-white/20">
                <LocalizedText>|</LocalizedText>
              </span>
              <LocalizedElement
                as="a"
                href="https://elib.pxu.edu.vn/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center transition-colors hover:text-white sm:min-h-6"
                title="Thư viện điện tử Trường Đại học Phú Xuân"
              >
                <LocalizedText>Thư viện số</LocalizedText>
                <span className="hidden lg:inline">
                  <LocalizedText>&nbsp;(E-LIB)</LocalizedText>
                </span>
              </LocalizedElement>
              <span className="hidden text-white/20 sm:inline">
                <LocalizedText>|</LocalizedText>
              </span>
              <Link
                href="/tuyen-sinh/hoc-phi-hoc-bong/"
                className="hidden min-h-6 items-center transition-colors hover:text-white sm:flex"
              >
                <LocalizedText>Học phí 2026</LocalizedText>
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div
          className={cn(
            "mx-auto flex max-w-[var(--width-container)] items-center justify-between px-4 transition-[height] duration-[var(--duration-slow)] sm:px-6 lg:px-8",
            scrolled ? "h-16" : "h-20",
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="relative shrink-0 transition-all duration-[var(--duration-slow)]"
            aria-label="Topica - Trang chủ"
          >
            <div
              className={cn(
                "flex items-center justify-center transition-all duration-[var(--duration-slow)]",
                scrolled ? "h-12 w-32" : "h-14 w-36 sm:w-40",
              )}
            >
              <Image
                src="/topica-logo-transparent.png"
                alt="Viện Đào tạo Quốc tế Topica"
                width={768}
                height={358}
                priority
                className={cn(
                  "h-auto w-full object-contain transition-all duration-[var(--duration-slow)]",
                  scrolled ? "max-h-14" : "max-h-16",
                )}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <LocalizedElement
            as="nav"
            className="hidden items-center gap-1 xl:flex"
            aria-label="Điều hướng chính"
          >
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
                    "rounded-md px-2 py-2.5 text-[14px] leading-5 font-semibold whitespace-nowrap transition-colors duration-[var(--duration-base)]",
                    openMenuId === group.id
                      ? "bg-white/10 text-white"
                      : "text-white/90 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <LocalizedText>{group.label}</LocalizedText>
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
          </LocalizedElement>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <LocalizedElement
              as="button"
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label="Tìm kiếm"
              aria-expanded={searchOpen}
              aria-controls="header-search"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white transition-colors duration-[var(--duration-base)] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {searchOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Search className="h-5 w-5" aria-hidden="true" />
              )}
            </LocalizedElement>

            <LocalizedText>
              {applyAction?.href && (
                <ButtonLink
                  href={applyAction.href}
                  external={applyAction.external}
                  variant="accent"
                  size="default"
                  className="hidden sm:inline-flex"
                >
                  <LocalizedText>{applyAction.label}</LocalizedText>
                </ButtonLink>
              )}
            </LocalizedText>

            {/* Mobile menu button */}
            <Button
              variant="icon"
              size="sm"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              className="bg-white/10 text-white hover:bg-white/20 hover:text-white xl:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {searchOpen && (
            <form
              id="header-search"
              action="/tim-kiem/"
              role="search"
              className="absolute top-full right-4 left-4 z-20 mt-2 flex items-center gap-2 rounded-lg border border-navy-700 bg-white p-2 shadow-lg sm:left-auto sm:w-80"
            >
              <label htmlFor="header-search-input" className="sr-only">
                <LocalizedText>Từ khóa tìm kiếm</LocalizedText>
              </label>
              <LocalizedElement
                as="input"
                id="header-search-input"
                name="q"
                type="search"
                autoFocus
                placeholder="Bạn muốn tìm gì?"
                className="min-w-0 flex-1 rounded-md border border-line-200 bg-white px-3 py-2 text-body-sm text-ink-950 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
              />
              <LocalizedElement
                as="button"
                type="submit"
                aria-label="Tìm kiếm"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gold-500 text-navy-900 transition-colors hover:bg-gold-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
              </LocalizedElement>
            </form>
          )}
        </div>
      </header>

      {/* Header spacer */}
      <div
        className={cn(
          "transition-[height] duration-[var(--duration-slow)]",
          scrolled ? "h-[calc(2rem+4rem)]" : "h-[calc(2rem+5rem)]",
        )}
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer */}
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
