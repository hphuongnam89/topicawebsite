"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  Upload,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface MediaItem {
  name: string;
  url: string;
  access: "public" | "private";
  mimeType: string;
  size: number;
  updatedAt: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
        setError(null);
      } else {
        setError(`Không thể tải thư viện media (mã phản hồi HTTP ${res.status}). Vui lòng thử lại.`);
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối khi tải thư viện media. Vui lòng kiểm tra mạng và thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchMedia();
    })();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tải ảnh thất bại.");

      setMessage({ type: "success", text: `Đã tải ảnh "${file.name}" lên thành công!` });
      fetchMedia();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi tải ảnh lên." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCopy = (url: string) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa file "${item.name}" không?`)) return;

    const key = `${item.access}:${item.name}`;
    setDeletingKey(key);
    setMessage(null);

    try {
      const res = await fetch(
        `/api/admin/media?name=${encodeURIComponent(item.name)}&access=${item.access}`,
        {
          method: "DELETE",
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xóa file thất bại.");

      setMessage({ type: "success", text: `Đã xóa file "${item.name}".` });
      setMedia((prev) =>
        prev.filter((entry) => entry.name !== item.name || entry.access !== item.access),
      );
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi xóa file." });
    } finally {
      setDeletingKey(null);
    }
  };

  const filteredMedia = media.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-brand-700" />
            <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">
              Thư viện Hình ảnh & Media
            </h1>
          </div>
          <p className="mt-1 text-body-sm text-ink-500">
            Quản lý toàn bộ hình ảnh và tệp tải lên phục vụ bài viết và các khối trang chủ.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,application/pdf"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 py-2.5 text-body-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-800 disabled:opacity-70"
          >
            {uploading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>{uploading ? "Đang tải lên..." : "Tải tệp mới"}</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-start gap-3 rounded-lg border p-4 text-body-sm ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên file..."
          className="h-10 w-full rounded-lg border border-line-200 bg-white pr-3 pl-9 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
        />
      </div>

      {/* Error banner when background refresh fails */}
      {error && media.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 text-body-sm text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchMedia()}
            className="inline-flex items-center gap-1 text-xs font-semibold underline hover:text-amber-900"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {/* Media Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex items-center gap-2 text-ink-500">
            <RefreshCw className="h-5 w-5 animate-spin text-brand-700" />
            <span>Đang tải thư viện media...</span>
          </div>
        </div>
      ) : error && media.length === 0 ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-12 text-center text-red-800">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-600" />
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={() => fetchMedia()}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 focus:outline-2 focus:outline-red-600"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-300 bg-white p-12 text-center text-ink-500">
          <ImageIcon className="mx-auto mb-3 h-12 w-12 text-ink-300" />
          <p className="font-semibold text-ink-800">
            {search ? "Không tìm thấy tệp nào phù hợp." : "Chưa có tệp nào trong thư viện."}
          </p>
          {!search && (
            <p className="mt-1 text-xs text-ink-400">
              Bấm &quot;Tải tệp mới&quot; để thêm tệp vào hệ thống.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredMedia.map((item) => (
            <div
              key={`${item.access}:${item.name}`}
              className="group relative overflow-hidden rounded-xl border border-line-200 bg-white shadow-xs transition-all hover:border-brand-300 hover:shadow-md"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                {item.mimeType.startsWith("image/") ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                ) : item.mimeType.startsWith("video/") ? (
                  <video src={item.url} controls className="h-full w-full object-contain" />
                ) : item.mimeType === "application/pdf" ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-full flex-col items-center justify-center gap-2 text-navy-900"
                  >
                    <ImageIcon className="h-10 w-10" aria-hidden="true" />
                    <span className="text-xs font-semibold">Mở tài liệu PDF</span>
                  </a>
                ) : (
                  <div className="flex h-full items-center justify-center text-ink-500">
                    <ImageIcon className="h-10 w-10" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="p-3">
                <p className="truncate text-xs font-semibold text-ink-900" title={item.name}>
                  {item.name}
                </p>
                <p
                  className={`mt-1 text-[11px] font-semibold ${item.access === "private" ? "text-amber-800" : "text-emerald-700"}`}
                >
                  {item.access === "private" ? "Riêng tư · chỉ admin xem" : "Công khai"}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px] text-ink-400">
                  <span>{formatBytes(item.size)}</span>
                  <span>{new Date(item.updatedAt).toLocaleDateString("vi-VN")}</span>
                </div>

                <div className="mt-2.5 flex items-center gap-2 border-t border-line-100 pt-2">
                  <button
                    onClick={() => handleCopy(item.url)}
                    className="flex flex-1 items-center justify-center gap-1 rounded bg-slate-100 py-1 text-[11px] font-medium text-ink-700 transition-colors hover:bg-slate-200"
                  >
                    {copiedUrl === item.url ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-700">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Sao chép link</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deletingKey === `${item.access}:${item.name}`}
                    className="rounded p-1 text-ink-500 transition-colors hover:bg-red-50 hover:text-error"
                    title="Xóa tệp"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
