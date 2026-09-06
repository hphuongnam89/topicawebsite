import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center bg-paper px-4 py-16">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-line-200 bg-white p-8 text-center shadow-sm md:p-14">
        <Link
          href="/"
          className="mx-auto inline-flex items-center gap-2 text-body-sm font-semibold tracking-[0.12em] text-brand-700 uppercase"
        >
          <GraduationCap aria-hidden="true" className="h-5 w-5" />
          Topica University
        </Link>
        <p className="text-brand-200 mt-10 font-display text-[5rem] leading-none font-semibold md:text-[7rem]">
          404
        </p>
        <h1 className="mt-4 font-display text-h1 font-semibold text-ink-950">
          Không tìm thấy trang bạn cần
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-body-lg text-ink-600">
          Đường dẫn có thể đã thay đổi hoặc nội dung không còn tồn tại. Bạn có thể quay lại trang
          chủ hoặc xem danh sách ngành đào tạo.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Về trang chủ
          </ButtonLink>
          <ButtonLink href="/nganh-dao-tao/" variant="secondary">
            Xem ngành đào tạo
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
