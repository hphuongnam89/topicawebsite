export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="mx-auto min-h-[65vh] max-w-7xl px-6 py-16">
      <span className="sr-only">Đang tải nội dung…</span>
      <div aria-hidden="true" className="space-y-8 motion-safe:animate-pulse">
        <div className="h-4 w-36 rounded bg-line-200" />
        <div className="h-12 w-3/4 rounded bg-line-200" />
        <div className="h-5 w-1/2 rounded bg-line-200" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-56 rounded-lg bg-line-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
