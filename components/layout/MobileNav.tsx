"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronDown } from "lucide-react";
import { primaryNav, actionItems } from "@/data/navigation";
import { cn } from "@/components/ui/cn";
import { ButtonLink } from "@/components/ui/Button";
import { transitions } from "@/lib/motion";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      // Focus the close button after animation
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab" || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  const toggleAccordion = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const applyAction = actionItems.find((a) => a.id === "apply");
  const consultAction = actionItems.find((a) => a.id === "consult");

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitions.base}
            className="fixed inset-0 z-[60] bg-ink-950/40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={transitions.slow}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
            className="fixed top-0 right-0 bottom-0 z-[70] flex w-full max-w-[360px] flex-col bg-canvas shadow-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line-100 px-4 py-3">
              <span className="text-body-sm font-semibold text-ink-950">Menu</span>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Đóng menu"
                className="flex h-10 w-10 items-center justify-center rounded-md text-ink-800 transition-colors hover:bg-brand-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Điều hướng">
              <ul className="space-y-1">
                {primaryNav.map((group) => (
                  <li key={group.id}>
                    {group.columns.length > 0 ? (
                      <>
                        {/* Accordion trigger */}
                        <button
                          onClick={() => toggleAccordion(group.id)}
                          aria-expanded={expandedId === group.id}
                          aria-controls={`mobile-nav-${group.id}`}
                          className="flex w-full items-center justify-between rounded-md px-3 py-3 text-body font-semibold text-ink-950 transition-colors hover:bg-brand-50"
                        >
                          {group.label}
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-ink-400 transition-transform duration-[var(--duration-base)]",
                              expandedId === group.id && "rotate-180",
                            )}
                          />
                        </button>

                        {/* Accordion content */}
                        <AnimatePresence>
                          {expandedId === group.id && (
                            <motion.div
                              id={`mobile-nav-${group.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={transitions.slow}
                              className="overflow-hidden"
                            >
                              <div className="space-y-4 pt-1 pb-2 pl-3">
                                {group.columns.map((column) => (
                                  <div key={column.heading}>
                                    <p className="mb-1 px-3 text-[11px] font-bold tracking-wide text-ink-400 uppercase">
                                      {column.heading}
                                    </p>
                                    <ul className="space-y-0.5">
                                      {column.items.map((item) =>
                                        item.href ? (
                                          <li key={item.label}>
                                            <Link
                                              href={item.href}
                                              onClick={onClose}
                                              className="block rounded-md px-3 py-2.5 text-body-sm text-ink-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
                                            >
                                              {item.label}
                                            </Link>
                                          </li>
                                        ) : null,
                                      )}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={group.href}
                        onClick={onClose}
                        className="block rounded-md px-3 py-3 text-body font-semibold text-ink-950 transition-colors hover:bg-brand-50"
                      >
                        {group.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* CTA Footer */}
            <div className="space-y-3 border-t border-line-100 px-4 py-4">
              {applyAction?.href && (
                <ButtonLink
                  href={applyAction.href}
                  external={applyAction.external}
                  className="w-full"
                  onClick={onClose}
                >
                  {applyAction.label}
                </ButtonLink>
              )}
              {consultAction && (
                <ButtonLink
                  href="/lien-he/"
                  variant="secondary"
                  className="w-full"
                  onClick={onClose}
                >
                  {consultAction.label}
                </ButtonLink>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
