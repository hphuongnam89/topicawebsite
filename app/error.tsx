"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[50vh] items-center justify-center bg-canvas px-6 py-20 text-center">
      <div className="max-w-lg">
        <p className="text-body-sm font-semibold tracking-[0.14em] text-brand-700 uppercase">
          Có lỗi tạm thời
        </p>
        <h1 className="mt-3 font-display text-h2 text-ink-950">Không thể tải nội dung</h1>
        <p className="mt-4 text-body text-ink-600">
          Vui lòng thử lại. Nếu lỗi tiếp tục xảy ra, hãy quay lại sau ít phút.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 rounded-md bg-brand-700 px-5 py-3 font-semibold text-white hover:bg-brand-800"
        >
          Thử lại
        </button>
      </div>
    </main>
  );
}
