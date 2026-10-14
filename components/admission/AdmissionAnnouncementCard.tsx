import { LocalizedText } from "@/components/i18n/LocalizedText";
import { cn } from "@/components/ui/cn"
import Link from "@/components/i18n/LocalizedLink"
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/StatusBadge"

export interface AdmissionAnnouncementCardProps {
  title: string
  href: string
  date: string
  category?: string
  status?: StatusBadgeVariant
  summary?: string
  className?: string
}

export function AdmissionAnnouncementCard({
  title,
  href,
  date,
  category,
  status,
  summary,
  className,
}: AdmissionAnnouncementCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col rounded-lg border border-line-200 bg-paper p-5",
        "transition-all duration-200 hover:-translate-y-[1px] hover:border-brand-200 hover:shadow-sm",
        className
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <LocalizedText>{category && (
          <span className="text-xs font-medium uppercase tracking-wider text-brand-600">
            <LocalizedText>{category}</LocalizedText>
          </span>
        )}</LocalizedText>
        <span className="text-xs text-ink-400"><LocalizedText>{date}</LocalizedText></span>
        {status && <StatusBadge variant={status} />}
      </div>
      <h3 className="mb-2 line-clamp-2 text-body-lg font-semibold text-ink-950 group-hover:text-brand-700">
        <LocalizedText>{title}</LocalizedText>
      </h3>
      <LocalizedText>{summary && (
        <p className="mt-auto line-clamp-2 text-body-sm text-ink-600">
          <LocalizedText>{summary}</LocalizedText>
        </p>
      )}</LocalizedText>
    </Link>
  )
}
