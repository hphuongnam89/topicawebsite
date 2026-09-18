"use client";

import { Button, ButtonLink } from "@/components/ui/Button";

export default function PageError({ retry }: { retry: () => void }) {
  return (
    <div className="mx-auto min-h-[60vh] max-w-2xl px-6 py-20 text-center">
      <h1 className="font-display text-h2">Chưa thể tải nội dung</h1>
      <p className="mt-4 text-ink-600">
        Kết nối đang gặp gián đoạn. Bạn có thể thử lại sau ít phút.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button onClick={retry}>Thử lại</Button>
        <ButtonLink href="/" variant="secondary">
          Về trang chủ
        </ButtonLink>
      </div>
    </div>
  );
}
