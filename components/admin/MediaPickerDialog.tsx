import { Image as ImageIcon, RefreshCw, X } from "lucide-react";

type MediaItem = { name: string; url: string; size: number; access: "public" | "private" };

export function MediaPickerDialog({
  media,
  loading,
  error,
  onRetry,
  onClose,
  onSelect,
}: {
  media: MediaItem[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-line-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-navy-800" />
            <h3 className="font-display text-lg font-bold text-ink-950">
              Chọn ảnh đại diện từ Thư viện Media
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-slate-100 hover:text-ink-700"
            aria-label="Đóng thư viện ảnh"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center gap-2 text-ink-500">
              <RefreshCw className="h-5 w-5 animate-spin text-brand-700" />
              <span>Đang tải thư viện media...</span>
            </div>
          ) : error ? (
            <div role="alert" className="py-12 text-center text-error">
              <p>{error}</p>
              <button type="button" className="mt-2 underline" onClick={onRetry}>
                Tải lại thư viện
              </button>
            </div>
          ) : media.length === 0 ? (
            <div className="py-12 text-center text-ink-500">
              <p>Chưa có tệp nào trong thư viện media.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {media
                .filter((item) => /\.(jpg|jpeg|png|webp|gif)$/i.test(item.name || item.url))
                .map((item) => (
                  <button
                    key={`${item.access}:${item.name}`}
                    type="button"
                    onClick={() => onSelect(item)}
                    className="group flex flex-col overflow-hidden rounded-lg border border-line-200 bg-white text-left transition-all hover:border-brand-600 hover:shadow-md focus:outline-2 focus:outline-brand-600"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-2">
                      <p
                        className="line-clamp-1 text-xs font-semibold text-ink-900"
                        title={item.name}
                      >
                        {item.name}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
        <div className="border-t border-line-200 px-6 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line-200 bg-white px-4 py-2 text-xs font-semibold text-ink-700 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
