"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sanitizeWordPressHtml } from "@/lib/cms/html";
import {
  Save,
  ArrowLeft,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit3,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
  Globe,
} from "lucide-react";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

export interface PageFormData {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  featured_image: string;
  status: "published" | "draft";
  seo_title: string;
  seo_description: string;
  published_at: string;
}

interface PageEditorFormProps {
  initialData?: PageFormData;
  isEdit?: boolean;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function PageEditorForm({ initialData, isEdit = false }: PageEditorFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<PageFormData>(
    initialData || {
      title: "",
      slug: "",
      excerpt: "",
      content_html: "",
      featured_image: "",
      status: "published",
      seo_title: "",
      seo_description: "",
      published_at: new Date().toISOString().slice(0, 16),
    },
  );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !isEdit && !prev.slug ? generateSlug(val) : prev.slug,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Upload failed");

      const resData = await res.json();
      setFormData((prev) => ({ ...prev, featured_image: resData.url }));
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const cleanHtml = () => {
    if (window.confirm("Thao tác này sẽ dọn dẹp các mã HTML rác. Bạn có muốn tiếp tục?")) {
      setFormData((prev) => ({
        ...prev,
        content_html: sanitizeWordPressHtml(prev.content_html),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const url = isEdit ? `/api/admin/pages/${formData.id}` : "/api/admin/pages";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save page");
      }

      setSuccess("Lưu trang thành công!");
      if (!isEdit) {
        setTimeout(() => {
          router.push(`/admin/pages/${data.id}/edit`);
        }, 1000);
      } else {
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/pages"
            className="text-ink-500 rounded-full p-2 transition-colors hover:bg-white hover:text-ink-950"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-2xl font-bold text-ink-950">
            {isEdit ? "Chỉnh sửa Trang tĩnh" : "Thêm Trang mới"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {isEdit && (
            <a
              href={`/${formData.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-ink-700 inline-flex items-center gap-2 rounded-lg border border-line-200 bg-white px-4 py-2.5 text-body-sm font-semibold shadow-xs transition-colors hover:bg-slate-50"
            >
              <Globe className="text-ink-500 h-4 w-4" />
              <span>Xem thực tế</span>
            </a>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-body-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-800 disabled:opacity-70"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{saving ? "Đang lưu..." : "Lưu Trang"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-error/10 p-4 text-sm text-error">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content Column */}
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-6 rounded-xl border border-line-200 bg-white p-6 shadow-xs">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-ink-950">Tiêu đề trang</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="text-body-base h-12 w-full rounded-lg border border-line-200 bg-white px-4 text-ink-950 focus:border-brand-600 focus:outline-none"
                  placeholder="Nhập tiêu đề trang..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-ink-950">Đường dẫn (Slug)</label>
                <div className="flex overflow-hidden rounded-lg border border-line-200 bg-white focus-within:border-brand-600">
                  <span className="text-ink-500 flex items-center border-r border-line-200 bg-slate-50 px-3 text-sm">
                    topica.vn/
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="h-10 w-full bg-transparent px-3 text-sm text-ink-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-ink-950">Tóm tắt ngắn (Excerpt)</label>
                <textarea
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full rounded-lg border border-line-200 bg-white p-3 text-sm text-ink-950 focus:border-brand-600 focus:outline-none"
                  placeholder="Tóm tắt ngắn gọn nội dung trang..."
                />
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="space-y-1">
            <label className="flex items-center justify-between text-sm font-semibold text-ink-950">
              <span>Nội dung chính</span>
              <button
                type="button"
                onClick={cleanHtml}
                className="flex items-center gap-1.5 rounded px-2 py-1 text-brand-600 transition-colors hover:bg-slate-100"
                title="Làm sạch mã HTML từ nguồn khác"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold tracking-wider uppercase">
                  Làm sạch HTML rác
                </span>
              </button>
            </label>
            <RichTextEditor
              value={formData.content_html}
              onChange={(val) => setFormData({ ...formData, content_html: val })}
              onUploadImage={async (file) => {
                const data = new FormData();
                data.append("file", file);
                const res = await fetch("/api/admin/upload", {
                  method: "POST",
                  body: data,
                });
                if (!res.ok) throw new Error("Upload failed");
                const resData = await res.json();
                return resData.url;
              }}
            />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="space-y-6 rounded-xl border border-line-200 bg-white p-6 shadow-xs">
            <h3 className="font-semibold text-ink-950">Cài đặt Trang</h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-ink-950">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as "published" | "draft" })
                  }
                  className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
                >
                  <option value="published">Xuất bản</option>
                  <option value="draft">Bản nháp</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-ink-950">Ngày đăng</label>
                <input
                  type="datetime-local"
                  value={formData.published_at.slice(0, 16)}
                  onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                  className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-ink-950">Ảnh đại diện</label>
                {formData.featured_image ? (
                  <div className="relative overflow-hidden rounded-lg border border-line-200">
                    <img
                      src={formData.featured_image}
                      alt="Featured"
                      className="aspect-video w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, featured_image: "" })}
                      className="absolute top-2 right-2 rounded-md bg-black/50 p-1.5 text-white hover:bg-black/70"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line-200 bg-slate-50 transition-colors hover:bg-slate-100"
                  >
                    {uploading ? (
                      <RefreshCw className="h-6 w-6 animate-spin text-brand-600" />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-ink-400" />
                        <span className="text-ink-500 text-xs font-medium">Tải ảnh lên</span>
                      </>
                    )}
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-xl border border-line-200 bg-white p-6 shadow-xs">
            <h3 className="font-semibold text-ink-950">SEO & Meta</h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-ink-950">
                  Tiêu đề SEO (Meta Title)
                </label>
                <input
                  type="text"
                  value={formData.seo_title || ""}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-sm text-ink-950 focus:border-brand-600 focus:outline-none"
                  placeholder="Để trống sẽ dùng Tiêu đề trang"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-ink-950">
                  Mô tả SEO (Meta Description)
                </label>
                <textarea
                  rows={2}
                  value={formData.seo_description || ""}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  className="w-full rounded-lg border border-line-200 bg-white p-3 text-sm text-ink-950 focus:border-brand-600 focus:outline-none"
                  placeholder="Mô tả cho công cụ tìm kiếm..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
