import { cn } from "@/components/ui/cn"
import Link from "next/link"
import React from "react"

export interface QuickActionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  className?: string
}

export function QuickActionCard({
  icon,
  title,
  description,
  href,
  className,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col items-start gap-4 rounded-lg border border-line-200 bg-paper p-6",
        "transition-all duration-200 ease-in-out",
        "hover:-translate-y-[1px] hover:bg-canvas hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100 group-hover:text-brand-700">
        {icon}
      </div>
      <div>
        <h3 className="mb-1 text-h3 text-ink-950 transition-colors group-hover:text-brand-700">{title}</h3>
        <p className="text-body-sm text-ink-600">{description}</p>
      </div>
    </Link>
  )
}
