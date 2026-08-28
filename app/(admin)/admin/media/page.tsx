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
  size: number;
  updatedAt: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
      }
    } catch (err) {
      console.error(err);
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

  const handleDelete = async (name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa file "${name}" không?`)) return;

    setDeletingName(name);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/media?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Xóa file thất bại.");

      setMessage({ type: "success", text: `Đã xóa file "${name}".` });
      setMedia((prev) => prev.filter((item) => item.name !== name));
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi xóa file." });
    } finally {
      setDeletingName(null);
    }
  };

  const filteredMedia = media.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
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
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 py-2.5 text-body-sm font-semibold text-white shadow-sm hover:bg-brand-800 disabled:opacity-70 transition-all"
          >
            {uploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span>{uploading ? "Đang tải lên..." : "Tải ảnh mới"}</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-start gap-3 rounded-lg p-4 text-body-sm border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
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
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên file..."
          className="h-10 w-full rounded-lg border border-line-200 bg-white pl-9 pr-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
        />
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex items-center gap-2 text-ink-500">
            <RefreshCw className="h-5 w-5 animate-spin text-brand-700" />
            <span>Đang tải thư viện media...</span>
          </div>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-300 bg-white p-12 text-center text-ink-500">
          <ImageIcon className="mx-auto h-12 w-12 text-ink-300 mb-3" />
          <p className="font-semibold text-ink-800">Chưa có hình ảnh nào trong thư viện.</p>
          <p className="text-xs text-ink-400 mt-1">Bấm &quot;Tải ảnh mới&quot; để thêm hình ảnh vào hệ thống.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredMedia.map((item) => (
            <div
              key={item.name}
              className="group relative overflow-hidden rounded-xl border border-line-200 bg-white shadow-xs transition-all hover:border-brand-300 hover:shadow-md"
            >
              <div className="aspect-square w-full overflow-hidden bg-slate-100 relative">
                <img
                  src={item.url}
                  alt={item.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              <div className="p-3">
                <p className="truncate text-xs font-semibold text-ink-900" title={item.name}>
                  {item.name}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px] text-ink-400">
                  <span>{formatBytes(item.size)}</span>
                  <span>{new Date(item.updatedAt).toLocaleDateString("vi-VN")}</span>
                </div>

                <div className="mt-2.5 flex items-center gap-2 border-t border-line-100 pt-2">
                  <button
                    onClick={() => handleCopy(item.url)}
                    className="flex flex-1 items-center justify-center gap-1 rounded bg-slate-100 py-1 text-[11px] font-medium text-ink-700 hover:bg-slate-200 transition-colors"
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
                    onClick={() => handleDelete(item.name)}
                    disabled={deletingName === item.name}
                    className="rounded p-1 text-ink-500 hover:bg-red-50 hover:text-error transition-colors"
                    title="Xóa ảnh"
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
