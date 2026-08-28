"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FolderTree,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  article_count?: number;
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchCategories();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!slug) setSlug(generateSlug(val));
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tạo chuyên mục thất bại.");

      setMessage({ type: "success", text: `Đã tạo danh mục "${name}" thành công!` });
      setName("");
      setSlug("");
      setDescription("");
      fetchCategories();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi tạo danh mục." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, catName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa chuyên mục "${catName}" không?`)) return;

    setDeletingId(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Xóa danh mục thất bại.");

      setMessage({ type: "success", text: `Đã xóa danh mục "${catName}".` });
      fetchCategories();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi xóa danh mục." });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <FolderTree className="h-6 w-6 text-brand-700" />
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">
            Danh mục Tin tức
          </h1>
          <p className="mt-0.5 text-body-sm text-ink-500">
            Quản lý và phân loại các chuyên mục bài viết trên website Topica.
          </p>
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 1 Col: Create Form */}
        <div className="rounded-xl border border-line-200 bg-white p-6 shadow-xs h-fit space-y-4">
          <h2 className="font-display text-base font-bold text-ink-950 border-b border-line-100 pb-3">
            Thêm Danh mục Mới
          </h2>

          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1">
                Tên danh mục <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="VD: Góc Sinh Viên"
                className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1">
                Đường dẫn tĩnh (Slug) <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                placeholder="goc-sinh-vien"
                className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 font-mono text-xs text-ink-950 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1">
                Mô tả ngắn
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chuyên mục..."
                className="w-full rounded-lg border border-line-200 bg-white p-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-700 py-2.5 text-body-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-70 transition-colors"
            >
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span>{submitting ? "Đang thêm..." : "Thêm danh mục"}</span>
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Categories List Table */}
        <div className="overflow-hidden rounded-xl border border-line-200 bg-white shadow-xs lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="border-b border-line-200 bg-slate-50 text-xs font-semibold uppercase text-ink-500">
                <tr>
                  <th className="px-6 py-3.5">Tên danh mục</th>
                  <th className="px-4 py-3.5">Đường dẫn (Slug)</th>
                  <th className="px-4 py-3.5 text-center">Số bài viết</th>
                  <th className="px-6 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-ink-500">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin text-brand-700" />
                        <span>Đang tải danh mục...</span>
                      </div>
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-ink-500">
                      Chưa có danh mục nào.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-semibold text-ink-950">
                        {cat.name}
                        {cat.description && (
                          <p className="text-xs font-normal text-ink-500 mt-0.5">{cat.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-ink-600">
                        /{cat.slug}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                          {cat.article_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={deletingId === cat.id}
                          className="rounded-md p-1.5 text-ink-600 hover:bg-red-50 hover:text-error transition-colors"
                          title="Xóa danh mục"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
