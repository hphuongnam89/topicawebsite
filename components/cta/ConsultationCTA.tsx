import { cn } from "@/components/ui/cn"
import { ButtonLink } from "@/components/ui/Button"
import { PhoneCall } from "lucide-react"

export interface ConsultationCTAProps {
  heading?: string
  description?: string
  href?: string
  className?: string
}

export function ConsultationCTA({
  heading = "Bạn cần được tư vấn?",
  description = "Đội ngũ tuyển sinh Topica sẵn sàng hỗ trợ bạn.",
  href = "/lien-he/",
  className,
}: ConsultationCTAProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-6 rounded-lg border border-line-200 bg-paper p-6 sm:flex-row md:p-8",
        className
      )}
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <PhoneCall size={28} />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <h3 className="mb-2 text-h3 text-ink-950">{heading}</h3>
        <p className="text-body text-ink-600">{description}</p>
      </div>
      <div className="shrink-0">
        <ButtonLink href={href} variant="primary">
          Liên hệ ngay
        </ButtonLink>
      </div>
    </div>
  )
}
