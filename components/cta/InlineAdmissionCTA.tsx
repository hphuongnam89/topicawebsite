import { cn } from "@/components/ui/cn";
import { ButtonLink } from "@/components/ui/Button";
import { GraduationCap } from "lucide-react";

export interface InlineAdmissionCTAProps {
  message?: string;
  buttonLabel?: string;
  href?: string;
  className?: string;
}

export function InlineAdmissionCTA({
  message = "Tìm hiểu thêm về chương trình đào tạo và phương thức xét tuyển năm 2026.",
  buttonLabel = "Xem thông tin tuyển sinh",
  href = "/tuyen-sinh/",
  className,
}: InlineAdmissionCTAProps) {
  return (
    <div
      className={cn(
        "my-8 flex flex-col items-center gap-4 rounded-r-lg border-l-4 border-l-brand-600 bg-brand-50 p-4 sm:flex-row sm:p-5",
        className,
      )}
    >
      <div className="flex shrink-0 text-brand-600">
        <GraduationCap size={24} />
      </div>
      <p className="m-0 flex-1 text-body-sm font-medium text-ink-800">{message}</p>
      <div className="w-full shrink-0 sm:w-auto">
        <ButtonLink
          href={href}
          variant="secondary"
          size="sm"
          className="w-full bg-white hover:bg-brand-100 hover:text-brand-700 sm:w-auto"
        >
          {buttonLabel}
        </ButtonLink>
      </div>
    </div>
  );
}
