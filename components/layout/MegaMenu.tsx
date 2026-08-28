"use client";

import { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import type { NavColumn } from "@/data/navigation";
import { transitions } from "@/lib/motion";

interface MegaMenuProps {
  columns: NavColumn[];
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function MegaMenu({ columns, onClose, onMouseEnter, onMouseLeave }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation within the menu
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      const links = menuRef.current?.querySelectorAll("a");
      if (!links || links.length === 0) return;

      const currentIndex = Array.from(links).indexOf(document.activeElement as HTMLAnchorElement);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = currentIndex + 1 < links.length ? currentIndex + 1 : 0;
        links[next].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = currentIndex - 1 >= 0 ? currentIndex - 1 : links.length - 1;
        links[prev].focus();
      }
    },
    [onClose],
  );

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={transitions.base}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onKeyDown={handleKeyDown}
        role="menu"
        className="absolute top-full left-1/2 z-50 mt-1 w-max max-w-[640px] min-w-[280px] -translate-x-1/2 rounded-lg border border-line-200 bg-canvas p-5 shadow-sm"
      >
        <div
          className={`grid gap-8 ${columns.length > 2 ? "grid-cols-3" : columns.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}
        >
          {columns.map((column) => (
            <div key={column.heading}>
              <h3 className="mb-3 text-[11px] font-bold tracking-wide text-ink-400 uppercase">
                {column.heading}
              </h3>
              <ul className="space-y-0.5" role="none">
                {column.items.map((item) =>
                  item.href ? (
                    <li key={item.label} role="none">
                      <Link
                        href={item.href}
                        role="menuitem"
                        onClick={onClose}
                        className="block rounded-md px-2.5 py-2 text-body-sm text-ink-800 transition-colors duration-[var(--duration-base)] hover:bg-brand-50 hover:text-brand-700"
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
    </AnimatePresence>
  );
}
