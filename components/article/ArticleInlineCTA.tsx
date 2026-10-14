import { LocalizedText } from "@/components/i18n/LocalizedText";
import { cn } from "@/components/ui/cn";
import { ButtonLink } from "@/components/ui/Button";

interface ArticleInlineCTAProps {
  className?: string;
}

export function ArticleInlineCTA({ className }: ArticleInlineCTAProps) {
  return (
    <aside
      className={cn(
        "my-10 rounded-r-lg border-l-4 border-brand-500 bg-paper p-6 sm:p-8",
        className,
      )}
    >
      <h3 className="mb-2 font-display text-h3 text-ink-950">
        <LocalizedText>Bạn quan tâm đến chương trình đào tạo?
      </LocalizedText></h3>
      <p className="mb-6 text-body text-ink-800">
        <LocalizedText>Đăng ký nhận tư vấn miễn phí từ chuyên viên tuyển sinh Topica.
      </LocalizedText></p>
      <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <ButtonLink href="/dang-ky" variant="primary" className="w-full justify-center">
          <LocalizedText>Nhận tư vấn
        </LocalizedText></ButtonLink>
        <ButtonLink href="/nganh-dao-tao" variant="secondary" className="w-full justify-center">
          <LocalizedText>Xem ngành đào tạo
        </LocalizedText></ButtonLink>
      </div>
    </aside>
  );
}
