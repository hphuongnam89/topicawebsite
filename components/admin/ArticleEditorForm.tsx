"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

interface CategoryOption {
  id: number;
  name: string;
}

export interface ArticleFormData {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  featured_image: string;
  category_id: number | null;
  tags: string;
  author_name: string;
  is_featured: boolean;
  status: "published" | "draft";
  seo_title: string;
  seo_description: string;
  published_at: string;
}

interface ArticleEditorFormProps {
  initialData?: ArticleFormData;
  categories: CategoryOption[];
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

export function ArticleEditorForm({
  initialData,
  categories,
  isEdit = false,
}: ArticleEditorFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ArticleFormData>(
    initialData || {
      title: "",
      slug: "",
      excerpt: "",
      content_html: "",
      featured_image: "",
      category_id: categories.length > 0 ? categories[0].id : null,
      tags: "",
      author_name: "Ban Biên Tập Topica",
      is_featured: false,
      status: "published",
      seo_title: "",
      seo_description: "",
      published_at: new Date().toISOString().slice(0, 16),
    }
  );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
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

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Tải ảnh thất bại.");

      setFormData((prev) => ({ ...prev, featured_image: resData.url }));
    } catch (err: any) {
      setError(err.message || "Lỗi tải ảnh lên.");
    } finally {
      setUploading(false);
    }
  };

  const insertTag = (openTag: string, closeTag: string = "") => {
    const textarea = document.getElementById("content-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = `${openTag}${selectedText || "Nội dung"}${closeTag}`;

    const newContent =
      textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    setFormData((prev) => ({ ...prev, content_html: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, start + replacement.length - closeTag.length);
    }, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      setError("Vui lòng điền tiêu đề và đường dẫn (slug) bài viết.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const url = isEdit ? `/api/admin/articles/${formData.id}` : "/api/admin/articles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể lưu bài viết.");
      }

      setSuccess(isEdit ? "Cập nhật bài viết thành công!" : "Tạo bài viết mới thành công!");
      setTimeout(() => {
        router.push("/admin/articles");
        router.refresh();
      }, 800);
    } catch (err: any) {
      setError(err.message || "Lỗi lưu bài viết.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-line-200 bg-white text-ink-700 hover:bg-paper transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-ink-950 sm:text-2xl">
              {isEdit ? "Chỉnh sửa Bài viết" : "Tạo Bài viết Mới"}
            </h1>
            <p className="text-xs text-ink-500">
              {isEdit ? `ID: ${formData.id}` : "Nhập nội dung và xuất bản lên website Topica"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-6 py-2.5 text-body-sm font-semibold text-white shadow-sm hover:bg-brand-800 disabled:opacity-70 transition-all"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Xuất bản bài viết"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-body-sm text-red-800 border border-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-lg bg-emerald-50 p-4 text-body-sm text-emerald-800 border border-emerald-200">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Title & Slug */}
          <div className="rounded-xl border border-line-200 bg-white p-6 shadow-xs space-y-4">
            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
                Tiêu đề bài viết <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Nhập tiêu đề bài viết..."
                className="h-11 w-full rounded-lg border border-line-200 bg-white px-3.5 text-base font-semibold text-ink-950 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
                Đường dẫn tĩnh (Slug) <span className="text-error">*</span>
              </label>
              <div className="flex items-center rounded-lg border border-line-200 bg-slate-50 px-3">
                <span className="text-xs text-ink-400 font-mono">/tin-tuc/</span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                  placeholder="tieu-de-bai-viet"
                  className="h-9 w-full bg-transparent px-1 font-mono text-xs text-ink-950 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
                Tóm tắt ngắn (Excerpt)
              </label>
              <textarea
                rows={3}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Đoạn văn ngắn tóm tắt nội dung bài viết hiển thị ở danh sách tin..."
                className="w-full rounded-lg border border-line-200 bg-white p-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div className="rounded-xl border border-line-200 bg-white shadow-xs overflow-hidden">
            {/* Editor Toolbar & Tab Switcher */}
            <div className="flex flex-wrap items-center justify-between border-b border-line-200 bg-slate-50 p-2.5 px-4 gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertTag("<h2>", "</h2>")}
                  className="rounded p-1.5 text-ink-700 hover:bg-slate-200"
                  title="Tiêu đề H2"
                >
                  <Heading2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<h3>", "</h3>")}
                  className="rounded p-1.5 text-ink-700 hover:bg-slate-200"
                  title="Tiêu đề H3"
                >
                  <Heading3 className="h-4 w-4" />
                </button>
                <span className="h-4 w-[1px] bg-line-200 mx-1" />
                <button
                  type="button"
                  onClick={() => insertTag("<strong>", "</strong>")}
                  className="rounded p-1.5 text-ink-700 hover:bg-slate-200"
                  title="In đậm"
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<em>", "</em>")}
                  className="rounded p-1.5 text-ink-700 hover:bg-slate-200"
                  title="In nghiêng"
                >
                  <Italic className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<ul>\n  <li>", "</li>\n</ul>")}
                  className="rounded p-1.5 text-ink-700 hover:bg-slate-200"
                  title="Danh sách gạch đầu dòng"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<blockquote>", "</blockquote>")}
                  className="rounded p-1.5 text-ink-700 hover:bg-slate-200"
                  title="Trích dẫn"
                >
                  <Quote className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt("Nhập liên kết URL:");
                    if (url) insertTag(`<a href="${url}">`, "</a>");
                  }}
                  className="rounded p-1.5 text-ink-700 hover:bg-slate-200"
                  title="Chèn liên kết"
                >
                  <LinkIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const imgUrl = prompt("Nhập URL hình ảnh:");
                    if (imgUrl) insertTag(`<img src="${imgUrl}" alt="Hình ảnh bài viết" />`);
                  }}
                  className="rounded p-1.5 text-ink-700 hover:bg-slate-200"
                  title="Chèn ảnh vào nội dung"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Tab Switcher */}
              <div className="flex items-center rounded-lg border border-line-200 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold ${
                    activeTab === "write"
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-600 hover:text-ink-950"
                  }`}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Soạn thảo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold ${
                    activeTab === "preview"
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-600 hover:text-ink-950"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Xem trước</span>
                </button>
              </div>
            </div>

            {/* Editor Area */}
            <div className="p-4">
              {activeTab === "write" ? (
                <textarea
                  id="content-textarea"
                  rows={16}
                  required
                  value={formData.content_html}
                  onChange={(e) => setFormData({ ...formData, content_html: e.target.value })}
                  placeholder="<p>Nhập nội dung bài viết bằng định dạng văn bản hoặc HTML...</p>"
                  className="w-full font-mono text-body-sm text-ink-950 focus:outline-none resize-y"
                />
              ) : (
                <div
                  className="prose prose-slate max-w-none min-h-[380px] p-2"
                  dangerouslySetInnerHTML={{ __html: formData.content_html || "<em>Chưa có nội dung để xem trước.</em>" }}
                />
              )}
            </div>
          </div>

          {/* SEO Metadata Box */}
          <div className="rounded-xl border border-line-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-display text-base font-bold text-ink-950 border-b border-line-100 pb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-brand-700" />
              <span>Tối ưu hóa SEO (On-page SEO)</span>
            </h3>

            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
                Tiêu đề SEO (Meta Title)
              </label>
              <input
                type="text"
                value={formData.seo_title || ""}
                onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                placeholder="Để trống sẽ dùng tiêu đề bài viết"
                className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
                Mô tả SEO (Meta Description)
              </label>
              <textarea
                rows={2}
                value={formData.seo_description || ""}
                onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                placeholder="Để trống sẽ dùng tóm tắt bài viết"
                className="w-full rounded-lg border border-line-200 bg-white p-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Column: Meta Sidebar */}
        <div className="space-y-6">
          {/* Publish Options */}
          <div className="rounded-xl border border-line-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-display text-base font-bold text-ink-950 border-b border-line-100 pb-3">
              Cài đặt Xuất bản
            </h3>

            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
              >
                <option value="published">Xuất bản (Công khai)</option>
                <option value="draft">Bản nháp (Chưa hiển thị)</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
                Danh mục chuyên mục
              </label>
              <select
                value={formData.category_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
              >
                <option value="">-- Chưa phân loại --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1.5">
                Tác giả / Nguồn tin
              </label>
              <input
                type="text"
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                placeholder="Ban Biên Tập Topica"
                className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-3 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="h-4 w-4 rounded border-line-200 text-brand-700 focus:ring-brand-500"
              />
              <span className="text-body-sm font-medium text-ink-900">
                Đánh dấu là Tin nổi bật (Featured)
              </span>
            </label>
          </div>

          {/* Featured Image */}
          <div className="rounded-xl border border-line-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-display text-base font-bold text-ink-950 border-b border-line-100 pb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-brand-700" />
              <span>Ảnh đại diện (Featured Image)</span>
            </h3>

            <div className="overflow-hidden rounded-lg border border-line-200 aspect-video relative bg-slate-100">
              {formData.featured_image ? (
                <img
                  src={formData.featured_image}
                  alt="Featured"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-ink-400">
                  Chưa có ảnh đại diện
                </div>
              )}
            </div>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-line-200 bg-paper py-2 text-body-sm font-semibold text-ink-800 hover:bg-slate-100 transition-colors"
              >
                {uploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span>{uploading ? "Đang tải lên..." : "Tải ảnh từ máy"}</span>
              </button>
            </div>

            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1">
                Hoặc nhập URL ảnh
              </label>
              <input
                type="url"
                value={formData.featured_image}
                onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                placeholder="https://..."
                className="h-9 w-full rounded-lg border border-line-200 bg-white px-3 text-xs text-ink-950 focus:border-brand-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
