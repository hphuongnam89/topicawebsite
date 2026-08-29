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
        Bạn quan tâm đến chương trình đào tạo?
      </h3>
      <p className="mb-6 text-body text-ink-800">
        Đăng ký nhận tư vấn miễn phí từ chuyên viên tuyển sinh Topica.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <ButtonLink href="/dang-ky" variant="primary">
          Nhận tư vấn
        </ButtonLink>
        <ButtonLink href="/nganh-dao-tao" variant="secondary">
          Xem ngành đào tạo
        </ButtonLink>
      </div>
    </aside>
  );
}
