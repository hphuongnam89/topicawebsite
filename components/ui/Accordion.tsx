"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./cn";

interface AccordionContextType {
  openValues: string[];
  toggleItem: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextType | null>(null);

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
}

export function Accordion({
  type = "single",
  defaultValue,
  className,
  children,
  ...props
}: AccordionProps) {
  const [openValues, setOpenValues] = React.useState<string[]>(() => {
    if (!defaultValue) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  });

  const toggleItem = React.useCallback(
    (value: string) => {
      setOpenValues((prev) => {
        if (prev.includes(value)) {
          return prev.filter((v) => v !== value);
        }
        return type === "single" ? [value] : [...prev, value];
      });
    },
    [type],
  );

  return (
    <AccordionContext.Provider value={{ openValues, toggleItem }}>
      <div className={cn("divide-y divide-line-200 border-y border-line-200", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

const ItemContext = React.createContext<{ value: string; isOpen: boolean } | null>(null);

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function AccordionItem({ value, className, children, ...props }: AccordionItemProps) {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error("AccordionItem must be used within Accordion");

  const isOpen = context.openValues.includes(value);

  return (
    <ItemContext.Provider value={{ value, isOpen }}>
      <div className={cn("py-1", className)} {...props}>
        {children}
      </div>
    </ItemContext.Provider>
  );
}

export interface AccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionTriggerProps) {
  const accContext = React.useContext(AccordionContext);
  const itemContext = React.useContext(ItemContext);
  if (!accContext || !itemContext)
    throw new Error("AccordionTrigger must be used within AccordionItem");

  const { value, isOpen } = itemContext;

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={() => accContext.toggleItem(value)}
      className={cn(
        "flex w-full items-center justify-between py-4 text-left font-serif text-h3 font-semibold text-ink-950 transition-colors hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700 sm:text-xl",
        isOpen && "text-navy-900",
        className,
      )}
      {...props}
    >
      <span className="pr-4">{children}</span>
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-ink-600 transition-transform duration-[var(--duration-base)]",
          isOpen && "rotate-180 bg-navy-50 text-navy-900",
        )}
      >
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </span>
    </button>
  );
}

export interface AccordionContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  const itemContext = React.useContext(ItemContext);
  if (!itemContext)
    throw new Error("AccordionContent must be used within AccordionItem");

  if (!itemContext.isOpen) return null;

  return (
    <div
      className={cn(
        "pt-1 pb-5 text-body text-ink-800 leading-relaxed animate-in fade-in duration-200",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
